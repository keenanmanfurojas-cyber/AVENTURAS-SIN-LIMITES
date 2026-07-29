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
import {
  normalizeEmail,
  normalizePhoneToE164,
} from "@/lib/contact-validation";
import { createBookingLookupToken } from "@/lib/booking-lookup-token";
import { deliverBookingNotificationSafely } from "@/lib/notifications/delivery";
import {
  isCiudadEsmeraldaBookingIdentifier,
  isTourComingSoon,
} from "@/lib/tours-data";

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
    if (draftInput && typeof draftInput === "object") {
      const submittedTours = ["tourSlug", "tourId", "tourName"].flatMap(
        (field) => {
          const value =
            field in draftInput
              ? (draftInput as Record<string, unknown>)[field]
              : null;
          return typeof value === "string" ? [value] : [];
        },
      );
      if (submittedTours.some((tour) => isTourComingSoon(tour))) {
        return NextResponse.json(
          { error: "Este tour estará disponible muy pronto." },
          { status: 409 },
        );
      }
      if (
        submittedTours.some(
          (tour) => !isCiudadEsmeraldaBookingIdentifier(tour),
        )
      ) {
        return NextResponse.json(
          { error: "El tour indicado no está disponible para reservas." },
          { status: 400 },
        );
      }
    }
    const parsedDraft = bookingDraftSchema.safeParse(draftInput);
    if (!parsedDraft.success) {
      return NextResponse.json(
        { error: "Revisa los datos obligatorios de la solicitud." },
        { status: 400 },
      );
    }
    const draft = parsedDraft.data;
    const buyerPhone = normalizePhoneToE164(
      draft.buyer.phone,
      draft.buyer.countryCode,
    );
    if (!buyerPhone) {
      return NextResponse.json(
        { error: "El teléfono del comprador no es válido." },
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
      buyer: {
        ...draft.buyer,
        email: normalizeEmail(draft.buyer.email),
        phone: buyerPhone,
      },
      participants: draft.participants.map((participant, index) => ({
        ...participant,
        email: normalizeEmail(participant.email),
        phone:
          normalizePhoneToE164(
            participant.phone,
            index === 0 ? draft.buyer.countryCode : "+506",
          ) ?? participant.phone,
      })),
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
      transactionalConsent: draft.transactionalConsent,
    };
    const reservation = await bookingRepository.create(record, proof);
    await deliverBookingNotificationSafely(reservation, "booking_received");
    return NextResponse.json(
      {
        lookupToken: createBookingLookupToken(
          reservation.bookingCode,
          reservation.buyer.email,
        ),
        reservation: { bookingCode: reservation.bookingCode },
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: safeBookingErrorMessage(error) },
      { status: 503 },
    );
  }
}
