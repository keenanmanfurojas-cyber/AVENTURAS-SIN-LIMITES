import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getAdminAccess,
  requestHasTrustedOrigin,
} from "@/lib/admin-auth";
import {
  getAdminBooking,
  hasAdministrativeBookingControl,
} from "@/lib/admin-bookings";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { deliverBookingNotificationSafely } from "@/lib/notifications/delivery";

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("edit"),
    buyer: z.object({
      fullName: z.string().trim().min(2).max(150),
      email: z.string().trim().email().max(254),
      phone: z.string().trim().min(7).max(30),
    }),
    selectedDate: z.iso.date(),
    selectedTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).or(z.literal("")),
    quantity: z.number().int().min(1).max(50),
    mode: z.enum(["direct", "gam_transport", "private"]),
    total: z.number().int().min(0).max(100_000_000),
    adminNotes: z.string().trim().max(2000),
    participants: z.array(z.object({
      fullName: z.string().trim().min(2).max(150),
      phone: z.string().trim().min(7).max(30),
      fitness: z.string().trim().min(1).max(1000),
      hasMedicalCondition: z.boolean(),
      medicalDetails: z.string().trim().max(2000),
    })).min(1).max(50),
  }).refine((value) => value.quantity === value.participants.length, {
    message: "La cantidad debe coincidir con los participantes.",
  }),
  z.object({
    action: z.literal("activate"),
    reason: z.string().trim().min(3).max(1000),
  }),
  z.object({
    action: z.literal("inactivate"),
    reason: z.string().trim().min(3).max(1000),
  }),
  z.object({
    action: z.literal("approve"),
    adminNotes: z.string().trim().max(2000).optional(),
  }),
  z.object({
    action: z.literal("reject"),
    adminNotes: z.string().trim().max(2000).optional(),
    reason: z.string().trim().min(3).max(1000),
  }),
  z.object({
    action: z.literal("note"),
    note: z.string().trim().min(1).max(2000),
  }),
]);

function transitionError(message: string) {
  if (message.includes("INVALID_STATUS_TRANSITION"))
    return "La reserva ya no permite esta transición.";
  if (message.includes("BOOKING_DATE_BLOCKED"))
    return "La fecha del tour está bloqueada.";
  if (message.includes("GROUP_CAPACITY_EXCEEDED"))
    return "Ya no existe capacidad suficiente para aprobar esta reserva.";
  if (message.includes("GROUP_DATE_UNAVAILABLE"))
    return "La fecha grupal ya no está disponible.";
  if (message.includes("PRIVATE_DATE_ALREADY_APPROVED"))
    return "Ya existe una reserva privada confirmada para esta fecha.";
  if (message.includes("PRIVATE_DATE_UNAVAILABLE"))
    return "La fecha ya no está disponible para una reserva privada.";
  if (message.includes("BOOKING_DATE_IN_PAST"))
    return "La fecha del tour no puede estar en el pasado.";
  if (message.includes("PARTICIPANT_QUANTITY_MISMATCH"))
    return "La cantidad no coincide con los participantes.";
  if (message.includes("BOOKING_ALREADY"))
    return "La reserva ya cambió de estado administrativo.";
  return "No fue posible completar la operación.";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!requestHasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Solicitud no permitida." }, { status: 403 });
  }

  const access = await getAdminAccess();
  if (!access.user) {
    return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });
  }
  if (!access.profile) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  }

  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Revisa los datos de la operación." },
      { status: 400 },
    );
  }

  const id = (await params).id;
  const current = await getAdminBooking(access.supabase, id);
  if (!current) {
    return NextResponse.json({ error: "Reserva no encontrada." }, { status: 404 });
  }

  const adminClient = createSupabaseAdminClient();
  if (parsed.data.action === "edit") {
    if (!(await hasAdministrativeBookingControl(access.supabase))) {
      return NextResponse.json(
        { error: "La migración administrativa todavía no está aplicada." },
        { status: 503 },
      );
    }
    const { error } = await adminClient.rpc("admin_edit_booking", {
      action_actor_id: access.user.id,
      payload: {
        admin_notes: parsed.data.adminNotes,
        booking_mode: parsed.data.mode,
        buyer: {
          email: parsed.data.buyer.email,
          full_name: parsed.data.buyer.fullName,
          phone: parsed.data.buyer.phone,
        },
        participants: parsed.data.participants.map((participant, index) => ({
          full_name: participant.fullName,
          has_medical_condition: participant.hasMedicalCondition,
          medical_details: participant.medicalDetails,
          phone: participant.phone,
          physical_condition: participant.fitness,
          position: index + 1,
        })),
        quantity: parsed.data.quantity,
        selected_date: parsed.data.selectedDate,
        selected_time: parsed.data.selectedTime,
        total_amount: parsed.data.total,
      },
      target_booking_id: current.id,
    });
    if (error) return NextResponse.json({ error: transitionError(error.message) }, { status: 409 });
  } else if (parsed.data.action === "activate" || parsed.data.action === "inactivate") {
    if (!(await hasAdministrativeBookingControl(access.supabase))) {
      return NextResponse.json(
        { error: "La migración administrativa todavía no está aplicada." },
        { status: 503 },
      );
    }
    const rpc = parsed.data.action === "activate"
      ? "admin_activate_booking"
      : "admin_deactivate_booking";
    const { error } = await adminClient.rpc(rpc, {
      action_actor_id: access.user.id,
      action_reason: parsed.data.reason,
      target_booking_id: current.id,
    });
    if (error) return NextResponse.json({ error: transitionError(error.message) }, { status: 409 });
  } else if (parsed.data.action === "note") {
    const { error } = await adminClient.from("admin_actions").insert({
      action: "note_added",
      actor_id: access.user.id,
      booking_id: current.id,
      new_status: current.status,
      notes: parsed.data.note,
      previous_status: current.status,
    });
    if (error) {
      return NextResponse.json(
        { error: "No fue posible guardar la nota." },
        { status: 500 },
      );
    }
  } else {
    if (current.status !== "pending_review") {
      return NextResponse.json(
        { error: "La reserva ya no está pendiente de revisión." },
        { status: 409 },
      );
    }

    const nextStatus =
      parsed.data.action === "approve" ? "approved" : "rejected";
    const { error } = await adminClient.rpc("transition_booking_status", {
      action_actor_id: access.user.id,
      action_notes: parsed.data.adminNotes || null,
      action_reason:
        parsed.data.action === "reject" ? parsed.data.reason : null,
      target_booking_id: current.id,
      target_status: nextStatus,
    });
    if (error) {
      return NextResponse.json(
        { error: transitionError(error.message) },
        { status: 409 },
      );
    }
  }

  const record = await getAdminBooking(access.supabase, id);
  if (
    record &&
    (parsed.data.action === "approve" || parsed.data.action === "reject")
  ) {
    await deliverBookingNotificationSafely(
      record,
      parsed.data.action === "approve"
        ? "booking_approved"
        : "booking_rejected",
    );
  }
  return NextResponse.json({ record });
}

const deleteSchema = z.object({
  bookingCode: z.string(),
  confirmed: z.literal(true),
  reason: z.string().trim().min(3).max(1000),
});

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!requestHasTrustedOrigin(request)) {
    return NextResponse.json({ error: "Solicitud no permitida." }, { status: 403 });
  }
  const access = await getAdminAccess();
  if (!access.user) return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });
  if (!access.profile) return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  if (access.profile.role !== "superadmin") {
    return NextResponse.json({ error: "Solo un superadministrador puede eliminar definitivamente." }, { status: 403 });
  }
  if (!(await hasAdministrativeBookingControl(access.supabase))) {
    return NextResponse.json(
      { error: "La migración administrativa todavía no está aplicada." },
      { status: 503 },
    );
  }
  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Completa ambas confirmaciones y el motivo." }, { status: 400 });
  const adminClient = createSupabaseAdminClient();
  const { data, error } = await adminClient.rpc("admin_delete_booking", {
    action_actor_id: access.user.id,
    action_reason: parsed.data.reason,
    confirmation_code: parsed.data.bookingCode,
    target_booking_id: (await params).id,
  });
  if (error) {
    const message = error.message.includes("BOOKING_CODE_MISMATCH")
      ? "El código escrito no coincide."
      : error.message.includes("BOOKING_MUST_BE_INACTIVE")
        ? "Primero debes inactivar la reserva."
        : "No fue posible eliminar la reserva.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
  const deletion = data as {
    payment_proof_path?: string;
    proof_shared?: boolean;
  } | null;
  const proofPath = deletion?.payment_proof_path;
  let storageWarning: string | undefined;
  if (proofPath && !deletion?.proof_shared) {
    const { error: storageError } = await adminClient.storage
      .from("booking-payment-proofs")
      .remove([proofPath]);
    if (storageError) {
      console.error("Deleted booking proof cleanup failed", { proofPath, storageError });
      storageWarning = "La reserva se eliminó, pero el comprobante requiere limpieza manual.";
    }
  }
  return NextResponse.json({ deleted: true, storageWarning });
}
