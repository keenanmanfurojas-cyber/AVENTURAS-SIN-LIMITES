import "server-only";

import { generateReservationCode } from "@/lib/booking-utils";
import {
  BookingRepositoryError,
  type BookingErrorCode,
} from "@/lib/bookings/errors";
import type {
  BookingFilters,
  BookingRepository,
  BookingStatusUpdate,
} from "@/lib/bookings/repository";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCostaRicaDateString } from "@/lib/timezone";
import type {
  BookingAdminAction,
  BookingMode,
  BookingRecord,
  BookingStatus,
  GroupTourDate,
  PrivateAvailability,
  PrivateAvailabilityStatus,
  YesNo,
} from "@/types/booking";
import { inferPhoneCountryCode } from "@/lib/contact-validation";

const paymentProofBucket = "booking-payment-proofs";
const signedUrlLifetimeSeconds = 60;
const bookingCodeAttempts = 5;

type BuyerRow = {
  email: string;
  full_name: string;
  id: string;
  phone: string;
};

type ParticipantRow = {
  booking_id: string;
  full_name: string;
  has_medical_condition: boolean;
  id: string;
  medical_details: string;
  phone: string;
  physical_condition: string;
  position: number;
};

type AdminActionRow = {
  action: string;
  actor_id: string | null;
  created_at: string;
  id: string;
  new_status: BookingStatus;
  notes: string | null;
  previous_status: BookingStatus | null;
  reason: string | null;
  previous_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
};

type BookingRow = {
  admin_actions?: AdminActionRow[];
  admin_notes: string;
  approved_at: string | null;
  archived_at?: string | null;
  archived_by?: string | null;
  archive_reason?: string | null;
  booking_code: string;
  booking_mode: BookingMode;
  buyer: BuyerRow;
  buyer_id: string;
  calendar_syncs?: unknown[];
  cancellation_reason: string | null;
  cancelled_at: string | null;
  created_at: string;
  currency: string;
  food_details: Record<string, unknown>;
  id: string;
  participants: ParticipantRow[];
  payment_proof_path: string;
  payment_status: "pending_review" | "rejected" | "verified";
  pending_hold_until: string | null;
  price_per_person: number;
  quantity: number;
  rejected_at: string | null;
  rejection_reason: string | null;
  selected_date: string;
  selected_time: string | null;
  sinpe_account_holder: string;
  sinpe_account_number: string;
  status: BookingStatus;
  timezone: string;
  total_amount: number;
  tour_name: string;
  tour_slug: string;
  transport_details: Record<string, unknown>;
  transactional_message_consent?: boolean;
  updated_at: string;
};

export const bookingDetailsSelection = `
  *,
  buyer:buyers(*),
  participants:booking_participants(*),
  admin_actions(*),
  calendar_syncs(*)
`;

function mapErrorCode(message: string): BookingErrorCode {
  if (message.includes("BOOKING_DATE_IN_PAST")) return "date_in_past";
  if (message.includes("BOOKING_DATE_BLOCKED")) return "date_blocked";
  if (message.includes("PRIVATE_DATE")) return "private_date_unavailable";
  if (message.includes("GROUP_DATE_UNAVAILABLE"))
    return "group_date_unavailable";
  if (message.includes("GROUP_CAPACITY_EXCEEDED"))
    return "group_capacity_exceeded";
  if (message.includes("BOOKING_NOT_FOUND")) return "not_found";
  return "unexpected";
}

function yesNo(value: unknown): YesNo {
  return value === "yes" || value === "no" ? value : "";
}

function mapAdminAction(row: AdminActionRow): BookingAdminAction {
  return {
    action: row.action,
    actorId: row.actor_id,
    createdAt: row.created_at,
    id: row.id,
    newStatus: row.new_status,
    notes: row.notes,
    previousStatus: row.previous_status,
    reason: row.reason,
    previousValues: row.previous_values,
    newValues: row.new_values,
  };
}

export function mapSupabaseBookingRow(value: unknown): BookingRecord {
  const row = value as BookingRow;
  const transport = row.transport_details ?? {};
  const food = row.food_details ?? {};
  const participants = [...(row.participants ?? [])].sort(
    (first, second) => first.position - second.position,
  );

  return {
    adminActions: (row.admin_actions ?? []).map(mapAdminAction),
    adminNotes: row.admin_notes,
    approvedAt: row.approved_at,
    archivedAt: row.archived_at,
    archivedBy: row.archived_by,
    archiveReason: row.archive_reason,
    bookingCode: row.booking_code,
    buyer: {
      countryCode: inferPhoneCountryCode(row.buyer.phone),
      email: row.buyer.email,
      fullName: row.buyer.full_name,
      isParticipant: row.quantity === 1,
      phone: row.buyer.phone,
    },
    cancellationReason: row.cancellation_reason,
    cancelledAt: row.cancelled_at,
    createdAt: row.created_at,
    foodDetails: {
      dietaryDetails:
        typeof food.dietaryDetails === "string" ? food.dietaryDetails : "",
      hasDietaryRestriction: yesNo(food.hasDietaryRestriction),
      requiresMeal: yesNo(food.requiresMeal),
    },
    id: row.id,
    mode: row.booking_mode,
    participants: participants.map((participant) => ({
      email: "",
      fitness: participant.physical_condition,
      fullName: participant.full_name,
      hasMedicalCondition: participant.has_medical_condition ? "yes" : "no",
      id: participant.id,
      medicalDetails: participant.medical_details,
      phone: participant.phone,
    })),
    paymentProof: {
      id: row.payment_proof_path,
      name: "comprobante",
      size: 0,
      type: "application/octet-stream",
    },
    paymentStatus: row.payment_status,
    pendingHoldUntil: row.pending_hold_until,
    pricePerPersonCrc: row.price_per_person,
    transactionalConsent: Boolean(row.transactional_message_consent),
    quantity: row.quantity,
    rejectedAt: row.rejected_at,
    rejectionReason: row.rejection_reason,
    selectedDate: row.selected_date,
    selectedTime: row.selected_time,
    sinpeAccountHolder: row.sinpe_account_holder,
    sinpeAccountNumber: row.sinpe_account_number,
    status: row.status,
    total: row.total_amount,
    tourName: row.tour_name,
    tourSlug: row.tour_slug,
    transportDetails: {
      direct: {
        arrivalTime:
          typeof transport.arrivalTime === "string"
            ? transport.arrivalTime
            : "",
        transportMethod:
          typeof transport.transportMethod === "string"
            ? transport.transportMethod
            : "",
      },
      gam_transport: {
        departurePoint:
          typeof transport.departurePoint === "string"
            ? transport.departurePoint
            : "",
        dietaryDetails:
          typeof food.dietaryDetails === "string" ? food.dietaryDetails : "",
        hasDietaryRestriction: yesNo(food.hasDietaryRestriction),
        requiresMeal: yesNo(food.requiresMeal),
      },
      private: {
        pickupZone:
          typeof transport.pickupZone === "string" ? transport.pickupZone : "",
        requiresMeal: yesNo(food.requiresMeal),
      },
    },
    updatedAt: row.updated_at,
  };
}

function proofExtension(mimeType: string) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

export class SupabaseBookingRepository implements BookingRepository {
  private get client() {
    return createSupabaseAdminClient();
  }

  async create(record: BookingRecord, proof: File) {
    return this.createBooking(record, proof);
  }

  async createBooking(record: BookingRecord, proof: File) {
    const proofPath = `${record.id}/${crypto.randomUUID()}.${proofExtension(proof.type)}`;
    const client = this.client;
    const { error: uploadError } = await client.storage
      .from(paymentProofBucket)
      .upload(proofPath, Buffer.from(await proof.arrayBuffer()), {
        cacheControl: "private, max-age=0",
        contentType: proof.type,
        upsert: false,
      });

    if (uploadError) {
      throw new BookingRepositoryError(
        "storage_failed",
        "No se pudo guardar el comprobante.",
        { cause: uploadError },
      );
    }

    let transactionCommitted = false;
    try {
      for (let attempt = 0; attempt < bookingCodeAttempts; attempt += 1) {
        const bookingCode =
          attempt === 0 ? record.bookingCode : generateReservationCode();
        const { data, error } = await client.rpc("create_booking_transaction_v2", {
          payload: {
            arrival_details: record.transportDetails.direct,
            booking_code: bookingCode,
            booking_mode: record.mode,
            buyer: {
              email: record.buyer.email,
              full_name: record.buyer.fullName,
              phone: record.buyer.phone,
            },
            food_details: record.foodDetails,
            participants: record.participants.map((participant, index) => ({
              full_name: participant.fullName,
              has_medical_condition:
                participant.hasMedicalCondition === "yes",
              medical_details: participant.medicalDetails,
              phone: participant.phone,
              physical_condition: participant.fitness,
              position: index + 1,
            })),
            payment_proof_path: proofPath,
            pending_hold_until: record.pendingHoldUntil,
            price_per_person: record.pricePerPersonCrc,
            quantity: record.quantity,
            selected_date: record.selectedDate,
            sinpe_account_holder: record.sinpeAccountHolder,
            sinpe_account_number: record.sinpeAccountNumber,
            timezone: "America/Costa_Rica",
            total_amount: record.total,
            tour_name: record.tourName,
            tour_slug: record.tourSlug,
            transport_details:
              record.mode === "gam_transport"
                ? record.transportDetails.gam_transport
                : record.mode === "private"
                  ? record.transportDetails.private
                  : record.transportDetails.direct,
            transactional_message_consent: record.transactionalConsent,
          },
        });

        if (!error && data) {
          transactionCommitted = true;
          const createdRow = data as unknown as {
            created_at: string;
            id: string;
            updated_at: string;
          };
          try {
            const details = await this.getBookingDetails(createdRow.id);
            if (details) return details;
          } catch {
            // La transacción ya confirmó. La respuesta mínima evita que el
            // cliente reintente y cree una segunda solicitud.
          }
          return {
            ...record,
            bookingCode,
            createdAt: createdRow.created_at,
            id: createdRow.id,
            paymentProof: {
              ...record.paymentProof,
              id: proofPath,
            },
            updatedAt: createdRow.updated_at,
          };
        }

        const collision =
          error?.code === "23505" &&
          (error.message.includes("booking_code") ||
            error.message.includes("bookings_booking_code_key"));
        if (collision && attempt < bookingCodeAttempts - 1) continue;

        throw new BookingRepositoryError(
          mapErrorCode(error?.message ?? ""),
          "La transacción de reserva fue rechazada.",
          { cause: error },
        );
      }
      throw new BookingRepositoryError(
        "unexpected",
        "No fue posible asignar un código único.",
      );
    } catch (error) {
      if (!transactionCommitted) {
        await client.storage.from(paymentProofBucket).remove([proofPath]);
      }
      throw error;
    }
  }

  async findById(id: string) {
    return this.getBookingDetails(id);
  }

  async getBookingByCode(code: string) {
    const { data, error } = await this.client
      .from("bookings")
      .select(bookingDetailsSelection)
      .eq("booking_code", code)
      .maybeSingle();
    if (error) {
      throw new BookingRepositoryError("unexpected", "Error consultando reserva.", {
        cause: error,
      });
    }
    return data ? mapSupabaseBookingRow(data) : null;
  }

  async getBookingDetails(id: string) {
    const { data, error } = await this.client
      .from("bookings")
      .select(bookingDetailsSelection)
      .eq("id", id)
      .maybeSingle();
    if (error) {
      throw new BookingRepositoryError("unexpected", "Error consultando reserva.", {
        cause: error,
      });
    }
    return data ? mapSupabaseBookingRow(data) : null;
  }

  async list(filters: BookingFilters = {}) {
    return this.listBookings(filters);
  }

  async listBookings(filters: BookingFilters = {}) {
    let query = this.client
      .from("bookings")
      .select(bookingDetailsSelection)
      .order("created_at", { ascending: false });
    if (filters.status) query = query.eq("status", filters.status);
    if (filters.date) query = query.eq("selected_date", filters.date);
    if (filters.mode) query = query.eq("booking_mode", filters.mode);
    if (filters.code) query = query.ilike("booking_code", `%${filters.code}%`);
    const { data, error } = await query;
    if (error) {
      throw new BookingRepositoryError("unexpected", "Error listando reservas.", {
        cause: error,
      });
    }
    const records = (data ?? []).map((row) =>
      mapSupabaseBookingRow(row),
    );
    const name = filters.name?.trim().toLocaleLowerCase("es");
    const search = filters.search?.trim().toLocaleLowerCase("es");
    return records.filter(
      (record) =>
        (!name ||
          record.buyer.fullName.toLocaleLowerCase("es").includes(name)) &&
        (!search ||
          [record.bookingCode, record.buyer.fullName, record.buyer.email]
            .join(" ")
            .toLocaleLowerCase("es")
            .includes(search)),
    );
  }

  async readPaymentProof() {
    return null;
  }

  async getPaymentProofUrl(id: string) {
    const record = await this.getBookingDetails(id);
    if (!record) return null;
    const { data, error } = await this.client.storage
      .from(paymentProofBucket)
      .createSignedUrl(record.paymentProof.id, signedUrlLifetimeSeconds);
    if (error) {
      throw new BookingRepositoryError(
        "storage_failed",
        "No se pudo firmar el comprobante.",
        { cause: error },
      );
    }
    return data.signedUrl;
  }

  async updateStatus(id: string, update: BookingStatusUpdate) {
    if (update.status === "approved") {
      return this.approveBooking(id, update.adminNotes);
    }
    if (update.status === "rejected") {
      return this.rejectBooking(id, update.reason ?? "", update.adminNotes);
    }
    return this.cancelBooking(id, update.reason ?? "", update.adminNotes);
  }

  async transition(
    id: string,
    status: "approved" | "cancelled" | "rejected",
    reason?: string,
    notes?: string,
  ) {
    const { data, error } = await this.client.rpc("transition_booking_status", {
      action_actor_id: null,
      action_notes: notes ?? null,
      action_reason: reason ?? null,
      target_booking_id: id,
      target_status: status,
    });
    if (error) {
      throw new BookingRepositoryError(
        mapErrorCode(error.message),
        "No fue posible cambiar el estado.",
        { cause: error },
      );
    }
    return data
      ? this.getBookingDetails((data as unknown as { id: string }).id)
      : null;
  }

  async approveBooking(id: string, adminNotes?: string) {
    return this.transition(id, "approved", undefined, adminNotes);
  }

  async rejectBooking(id: string, reason: string, adminNotes?: string) {
    return this.transition(id, "rejected", reason, adminNotes);
  }

  async cancelBooking(id: string, reason: string, adminNotes?: string) {
    return this.transition(id, "cancelled", reason, adminNotes);
  }

  async getPrivateAvailability(date: string): Promise<PrivateAvailability> {
    const { data, error } = await this.client.rpc("get_private_date_status", {
      requested_date: date,
    });
    if (error) {
      throw new BookingRepositoryError(
        mapErrorCode(error.message),
        "No fue posible consultar disponibilidad.",
        { cause: error },
      );
    }
    const result = (data as unknown as Array<{
      available: boolean;
      hold_until: string | null;
      status: PrivateAvailabilityStatus;
    }> | null)?.[0];
    if (!result) {
      throw new BookingRepositoryError(
        "unexpected",
        "La disponibilidad no devolvió resultado.",
      );
    }
    return {
      available: result.available,
      holdUntil: result.hold_until,
      status: result.status,
    };
  }

  async getGroupTourDates(tourSlug: string): Promise<GroupTourDate[]> {
    const { data, error } = await this.client
      .from("group_tour_availability")
      .select("*")
      .eq("tour_slug", tourSlug)
      .eq("is_active", true)
      .gte("date", getCostaRicaDateString())
      .order("date");
    if (error) {
      throw new BookingRepositoryError(
        "unexpected",
        "No fue posible consultar fechas grupales.",
        { cause: error },
      );
    }
    return (data ?? []).map((row) => ({
      availableSpots: row.available_spots,
      capacity: row.capacity,
      date: row.date,
      id: row.id,
      isActive: row.is_active,
      startTime: row.start_time,
      tourName: row.tour_name,
      tourSlug: row.tour_slug,
    }));
  }

  async createTourDate(
    date: Omit<GroupTourDate, "availableSpots" | "id">,
  ) {
    const { data, error } = await this.client
      .from("tour_dates")
      .insert({
        capacity: date.capacity,
        date: date.date,
        is_active: date.isActive,
        start_time: date.startTime,
        tour_name: date.tourName,
        tour_slug: date.tourSlug,
      })
      .select()
      .single();
    if (error) {
      throw new BookingRepositoryError("unexpected", "No se creó la fecha.", {
        cause: error,
      });
    }
    return { ...date, availableSpots: date.capacity, id: data.id };
  }

  async updateTourDate(
    id: string,
    date: Partial<Omit<GroupTourDate, "availableSpots" | "id">>,
  ) {
    const changes = {
      ...(date.capacity === undefined ? {} : { capacity: date.capacity }),
      ...(date.date === undefined ? {} : { date: date.date }),
      ...(date.isActive === undefined ? {} : { is_active: date.isActive }),
      ...(date.startTime === undefined ? {} : { start_time: date.startTime }),
      ...(date.tourName === undefined ? {} : { tour_name: date.tourName }),
      ...(date.tourSlug === undefined ? {} : { tour_slug: date.tourSlug }),
    };
    const { data, error } = await this.client
      .from("tour_dates")
      .update(changes)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) {
      throw new BookingRepositoryError("unexpected", "No se actualizó la fecha.", {
        cause: error,
      });
    }
    if (!data) return null;
    return {
      availableSpots: data.capacity,
      capacity: data.capacity,
      date: data.date,
      id: data.id,
      isActive: data.is_active,
      startTime: data.start_time,
      tourName: data.tour_name,
      tourSlug: data.tour_slug,
    };
  }

  async blockDate(date: string, reason: string) {
    const { error } = await this.client.from("blocked_dates").upsert(
      { date, is_active: true, reason },
      { onConflict: "date" },
    );
    if (error) {
      throw new BookingRepositoryError("unexpected", "No se bloqueó la fecha.", {
        cause: error,
      });
    }
  }

  async unblockDate(date: string) {
    const { error } = await this.client
      .from("blocked_dates")
      .update({ is_active: false })
      .eq("date", date)
      .eq("is_active", true);
    if (error) {
      throw new BookingRepositoryError("unexpected", "No se liberó la fecha.", {
        cause: error,
      });
    }
  }
}
