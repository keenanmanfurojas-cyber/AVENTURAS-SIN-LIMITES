import { NextResponse } from "next/server";

import { ciudadEsmeraldaBookingConfig as config } from "@/lib/booking-config";
import {
  generateReservationCode,
  getBookingPricePerPerson,
  getBookingTotal,
} from "@/lib/booking-utils";
import { bookingRepository } from "@/lib/bookings";
import {
  safeBookingErrorMessage,
} from "@/lib/bookings/errors";
import {
  bookingDraftSchema,
  paymentProofIsValid,
} from "@/lib/bookings/validation";
import type { BookingRecord } from "@/types/booking";

export const runtime = "nodejs";

function getHoldHours() {
  const parsed = Number.parseInt(
    process.env.PRIVATE_BOOKING_HOLD_HOURS ?? "24",
    10,
  );
  return Number.isFinite(parsed) && parsed > 0 && parsed <= 168 ? parsed : 24;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const proof = formData.get("paymentProof");
    const rawDraft = formData.get("draft");
    if (!(proof instanceof File) || typeof rawDraft !== "string") {
      return NextResponse.json({ error: "Solicitud incompleta." }, { status: 400 });
    }
    if (!(await paymentProofIsValid(proof))) {
      return NextResponse.json(
        {
          error:
            "El comprobante debe ser PNG, JPG, JPEG o WEBP y pesar máximo 5 MB.",
        },
        { status: 400 },
      );
    }
    let draftInput: unknown;
    try {
      draftInput = JSON.parse(rawDraft);
    } catch {
      return NextResponse.json(
        { error: "La solicitud no tiene un formato válido." },
        { status: 400 },
      );
    }
    const parsedDraft = bookingDraftSchema.safeParse(draftInput);
    if (!parsedDraft.success) {
      return NextResponse.json(
        { error: "Revisa los datos obligatorios de la solicitud." },
        { status: 400 },
      );
    }
    const draft = parsedDraft.data;
    const mode = config.modes.find((option) => option.id === draft.mode);
    const total = getBookingTotal(config, draft);
    const price = getBookingPricePerPerson(config, draft);
    if (!mode || total === null || price === null) {
      return NextResponse.json({ error: "Modalidad no válida." }, { status: 400 });
    }
    const now = new Date().toISOString();
    const pendingHoldUntil = new Date(
      Date.now() + getHoldHours() * 60 * 60 * 1000,
    ).toISOString();
    const record: BookingRecord = {
      id: crypto.randomUUID(),
      bookingCode: generateReservationCode(),
      tourSlug: config.tourId,
      tourName: config.tourName,
      selectedDate: draft.selectedDate,
      mode: mode.id,
      quantity: draft.participantCount,
      buyer: draft.buyer,
      participants: draft.participants,
      transportDetails: draft.modeDetails,
      foodDetails: {
        dietaryDetails: draft.modeDetails.gam_transport.dietaryDetails,
        hasDietaryRestriction:
          draft.modeDetails.gam_transport.hasDietaryRestriction,
        requiresMeal:
          draft.mode === "gam_transport"
            ? draft.modeDetails.gam_transport.requiresMeal
            : draft.modeDetails.private.requiresMeal,
      },
      total,
      sinpeAccountNumber: config.sinpeNumber,
      sinpeAccountHolder: config.sinpeAccountHolder,
      paymentProof: {
        id: crypto.randomUUID(),
        name: proof.name,
        size: proof.size,
        type: proof.type,
      },
      status: "pending_review",
      rejectionReason: null,
      adminNotes: "",
      createdAt: now,
      updatedAt: now,
      approvedAt: null,
      cancelledAt: null,
      pendingHoldUntil,
      pricePerPersonCrc: price,
    };
    return NextResponse.json(
      { reservation: await bookingRepository.create(record, proof) },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: safeBookingErrorMessage(error) },
      { status: 503 },
    );
  }
}
