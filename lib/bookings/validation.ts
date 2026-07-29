import { z } from "zod";
import {
  emailIsValid,
  normalizePhoneToE164,
  phoneIsValid,
} from "@/lib/contact-validation";

const yesNoSchema = z.enum(["", "no", "yes"]);

const participantSchema = z
  .object({
    email: z.string().trim().refine((value) => !value || emailIsValid(value)),
    fitness: z.string().trim().min(1).max(1000),
    fullName: z.string().trim().min(2).max(160),
    hasMedicalCondition: z.enum(["no", "yes"]),
    id: z.string().trim().min(1).max(100),
    medicalDetails: z.string().trim().max(2000),
    phone: z.string().trim().min(7).max(40).refine((value) => phoneIsValid(value)),
  })
  .superRefine((participant, context) => {
    if (
      participant.hasMedicalCondition === "yes" &&
      !participant.medicalDetails
    ) {
      context.addIssue({
        code: "custom",
        message: "Los detalles médicos son obligatorios.",
        path: ["medicalDetails"],
      });
    }
  });

export const bookingDraftSchema = z
  .object({
    buyer: z.object({
      countryCode: z.string().regex(/^\+[1-9]\d{0,3}$/),
      email: z.string().trim().max(254).refine(emailIsValid),
      fullName: z.string().trim().min(2).max(160),
      isParticipant: z.boolean(),
      phone: z.string().trim().min(4).max(40),
    }),
    mode: z.enum(["direct", "gam_transport", "private"]),
    modeDetails: z.object({
      direct: z.object({
        arrivalTime: z.string().trim().max(20),
        transportMethod: z.string().trim().max(160),
      }),
      gam_transport: z.object({
        departurePoint: z.string().trim().max(300),
        dietaryDetails: z.string().trim().max(1000),
        hasDietaryRestriction: yesNoSchema,
        requiresMeal: yesNoSchema,
      }),
      private: z.object({
        pickupZone: z.string().trim().max(300),
        requiresMeal: yesNoSchema,
      }),
    }),
    participantCount: z.number().int().positive().max(50),
    participants: z.array(participantSchema).min(1).max(50),
    selectedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    termsAccepted: z.literal(true),
    transactionalConsent: z.literal(true),
  })
  .superRefine((draft, context) => {
    if (draft.participants.length !== draft.participantCount) {
      context.addIssue({
        code: "custom",
        message: "La cantidad de participantes no coincide.",
        path: ["participants"],
      });
    }
    if (!normalizePhoneToE164(draft.buyer.phone, draft.buyer.countryCode)) {
      context.addIssue({
        code: "custom",
        message: "El teléfono del comprador no es válido.",
        path: ["buyer", "phone"],
      });
    }
    if (
      draft.mode === "gam_transport" &&
      !draft.modeDetails.gam_transport.departurePoint
    ) {
      context.addIssue({
        code: "custom",
        message: "El punto de salida es obligatorio.",
        path: ["modeDetails", "gam_transport", "departurePoint"],
      });
    }
    if (
      draft.mode === "private" &&
      !draft.modeDetails.private.requiresMeal
    ) {
      context.addIssue({
        code: "custom",
        message: "La selección de alimentación es obligatoria.",
        path: ["modeDetails", "private", "requiresMeal"],
      });
    }
  });

export const acceptedPaymentProofTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const maximumPaymentProofBytes = 5 * 1024 * 1024;

export async function paymentProofIsValid(file: File) {
  if (
    file.size === 0 ||
    file.size > maximumPaymentProofBytes ||
    !acceptedPaymentProofTypes.has(file.type)
  ) {
    return false;
  }

  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (file.type === "image/png") {
    return [137, 80, 78, 71, 13, 10, 26, 10].every(
      (value, index) => bytes[index] === value,
    );
  }
  if (file.type === "image/jpeg") {
    return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  }
  return (
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  );
}
