import { NextResponse } from "next/server";

import { ciudadEsmeraldaBookingConfig as config } from "@/lib/booking-config";
import {
  generateReservationCode,
  getBookingPricePerPerson,
  getBookingTotal,
} from "@/lib/booking-utils";
import { bookingRepository } from "@/lib/bookings";
import type { BookingDraft, BookingRecord } from "@/types/booking";

export const runtime = "nodejs";

const acceptedProofTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

function isCompleteDraft(draft: BookingDraft) {
  return Boolean(
    draft.mode &&
      draft.selectedDate &&
      draft.buyer.fullName.trim() &&
      draft.buyer.email.trim() &&
      draft.buyer.phone.trim() &&
      draft.termsAccepted &&
      draft.participants.length === draft.participantCount &&
      draft.participants.every(
        (participant) =>
          participant.fullName.trim() &&
          participant.phone.trim() &&
          participant.hasMedicalCondition &&
          participant.fitness.trim() &&
          (participant.hasMedicalCondition !== "yes" ||
            participant.medicalDetails.trim()),
      ),
  );
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const proof = formData.get("paymentProof");
    const rawDraft = formData.get("draft");
    if (!(proof instanceof File) || typeof rawDraft !== "string") {
      return NextResponse.json({ error: "Solicitud incompleta." }, { status: 400 });
    }
    if (!acceptedProofTypes.has(proof.type) || proof.size === 0) {
      return NextResponse.json(
        { error: "El comprobante no tiene un formato válido." },
        { status: 400 },
      );
    }
    const draft = JSON.parse(rawDraft) as BookingDraft;
    const date = config.availableDates.find(
      (available) => available.date === draft.selectedDate,
    );
    if (
      !isCompleteDraft(draft) ||
      !date ||
      date.status === "sold_out" ||
      date.availableSpots < draft.participantCount
    ) {
      return NextResponse.json(
        { error: "Revisa la fecha, los cupos y los datos obligatorios." },
        { status: 400 },
      );
    }
    const mode = config.modes.find((option) => option.id === draft.mode);
    const total = getBookingTotal(config, draft);
    const price = getBookingPricePerPerson(config, draft);
    if (!mode || total === null || price === null) {
      return NextResponse.json({ error: "Modalidad no válida." }, { status: 400 });
    }
    const now = new Date().toISOString();
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
      pricePerPersonCrc: price,
    };
    return NextResponse.json(
      { reservation: await bookingRepository.create(record, proof) },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "No fue posible guardar la solicitud." },
      { status: 500 },
    );
  }
}
