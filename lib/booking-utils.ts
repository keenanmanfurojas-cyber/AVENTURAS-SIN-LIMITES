import type {
  BookingConfig,
  BookingDraft,
  BookingErrors,
  BookingMode,
  BookingParticipant,
} from "@/types/booking";

export const bookingStepLabels = [
  "Modalidad",
  "Personas",
  "Fecha",
  "Comprador",
  "Participantes",
  "Detalles",
  "Pago SINPE",
  "Confirmación",
] as const;

export function createParticipant(index: number): BookingParticipant {
  return {
    id: `participant-${index + 1}`,
    email: "",
    fullName: "",
    phone: "",
    hasMedicalCondition: "",
    medicalDetails: "",
    fitness: "",
  };
}

export function createEmptyBookingDraft(): BookingDraft {
  return {
    mode: "",
    selectedDate: "",
    participantCount: 1,
    buyer: {
      fullName: "",
      email: "",
      phone: "",
      isParticipant: false,
    },
    participants: [createParticipant(0)],
    modeDetails: {
      gam_transport: {
        departurePoint: "",
        requiresMeal: "",
        hasDietaryRestriction: "",
        dietaryDetails: "",
      },
      private: {
        pickupZone: "",
        requiresMeal: "",
      },
      direct: {
        arrivalTime: "",
        transportMethod: "",
      },
    },
    termsAccepted: false,
  };
}

export function generateReservationCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const values = new Uint32Array(5);
  crypto.getRandomValues(values);
  const suffix = Array.from(
    values,
    (value) => alphabet[value % alphabet.length],
  ).join("");
  return `ASL-CE-${suffix}`;
}

export function getModeConfig(config: BookingConfig, mode: BookingMode | "") {
  return config.modes.find((option) => option.id === mode);
}

export function getBookingPricePerPerson(
  config: BookingConfig,
  draft: BookingDraft,
) {
  const mode = getModeConfig(config, draft.mode);
  if (!mode) return null;
  if (
    draft.mode === "private" &&
    draft.participantCount === 1 &&
    mode.singleParticipantPriceCrc
  ) {
    return mode.singleParticipantPriceCrc;
  }
  return mode.pricePerPersonCrc;
}

export function getBookingTotal(config: BookingConfig, draft: BookingDraft) {
  const pricePerPerson = getBookingPricePerPerson(config, draft);
  if (pricePerPerson === null) return null;
  const mealExtra =
    draft.mode === "private" &&
    draft.modeDetails.private.requiresMeal === "yes"
      ? config.privateMealExtraCrc
      : 0;
  return (pricePerPerson + mealExtra) * draft.participantCount;
}

export function validateBookingStep(
  step: number,
  draft: BookingDraft,
  config: BookingConfig,
  hasReceipt: boolean,
): BookingErrors {
  const errors: BookingErrors = {};

  if (step === 0 && !draft.mode) {
    errors.mode = "Selecciona una modalidad para continuar.";
  }

  if (step === 1) {
    const mode = getModeConfig(config, draft.mode);
    if (mode && draft.participantCount < mode.minimumParticipants) {
      errors.participantCount =
        `Esta modalidad requiere al menos ${mode.minimumParticipants} persona.`;
    }
  }

  if (step === 2) {
    const selected = config.availableDates.find(
      (item) => item.date === draft.selectedDate,
    );
    if (!selected) {
      errors.selectedDate = "Selecciona una fecha disponible para continuar.";
    } else if (
      selected.status === "sold_out" ||
      selected.availableSpots < draft.participantCount
    ) {
      errors.selectedDate = "Esta fecha no tiene cupos suficientes.";
    }
  }

  if (step === 3) {
    if (draft.participantCount === 1) {
      const participant = draft.participants[0];
      if (!participant?.fullName.trim()) {
        errors["participants.0.fullName"] = "Ingresa el nombre completo.";
      }
      if (!participant?.phone.trim()) {
        errors["participants.0.phone"] = "Ingresa el número de teléfono.";
      }
      if (
        !participant ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(participant.email.trim())
      ) {
        errors["participants.0.email"] =
          "Ingresa un correo electrónico válido.";
      }
      if (!participant?.hasMedicalCondition) {
        errors["participants.0.hasMedicalCondition"] = "Selecciona Sí o No.";
      }
      if (
        participant?.hasMedicalCondition === "yes" &&
        !participant.medicalDetails.trim()
      ) {
        errors["participants.0.medicalDetails"] =
          "Especifica la condición médica o alergia.";
      }
      if (!participant?.fitness.trim()) {
        errors["participants.0.fitness"] =
          "Describe la condición física actual.";
      }
    } else {
      if (!draft.buyer.fullName.trim()) {
        errors["buyer.fullName"] = "Ingresa el nombre completo.";
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.buyer.email.trim())) {
        errors["buyer.email"] = "Ingresa un correo electrónico válido.";
      }
      if (!draft.buyer.phone.trim()) {
        errors["buyer.phone"] = "Ingresa el teléfono o WhatsApp.";
      }
    }
  }

  if (step === 4 && draft.participantCount > 1) {
    draft.participants.forEach((participant, index) => {
      const prefix = `participants.${index}`;
      if (!participant.fullName.trim()) {
        errors[`${prefix}.fullName`] = "Ingresa el nombre completo.";
      }
      if (!participant.phone.trim()) {
        errors[`${prefix}.phone`] = "Ingresa el número de teléfono.";
      }
      if (!participant.hasMedicalCondition) {
        errors[`${prefix}.hasMedicalCondition`] = "Selecciona Sí o No.";
      }
      if (
        participant.hasMedicalCondition === "yes" &&
        !participant.medicalDetails.trim()
      ) {
        errors[`${prefix}.medicalDetails`] =
          "Especifica la condición médica o alergia.";
      }
      if (!participant.fitness.trim()) {
        errors[`${prefix}.fitness`] = "Describe la condición física actual.";
      }
    });
  }

  if (step === 5 && draft.mode === "gam_transport") {
    const details = draft.modeDetails.gam_transport;
    if (!details.departurePoint) {
      errors.departurePoint = "Selecciona un punto de salida.";
    }
    if (!details.hasDietaryRestriction) {
      errors.hasDietaryRestriction =
        "Indica si tiene alguna restricción alimentaria.";
    }
    if (
      details.hasDietaryRestriction === "yes" &&
      !details.dietaryDetails.trim()
    ) {
      errors.dietaryDetails = "Especifica la restricción alimentaria.";
    }
  }

  if (
    step === 5 &&
    draft.mode === "private" &&
    !draft.modeDetails.private.requiresMeal
  ) {
    errors.privateRequiresMeal =
      "Indica si deseas agregar alimentación al tour.";
  }

  if (
    step === 5 &&
    draft.mode === "direct" &&
    !draft.modeDetails.direct.arrivalTime
  ) {
    errors.arrivalTime = "Indica la hora aproximada de llegada.";
  }

  if (step === 6 && !hasReceipt) {
    errors.receipt = "Adjunta un comprobante para continuar.";
  }

  if (step === 7 && !draft.termsAccepted) {
    errors.termsAccepted =
      "Debes confirmar la información y aceptar los términos.";
  }

  return errors;
}
