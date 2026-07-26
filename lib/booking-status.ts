import type { BookingStatus } from "@/types/booking";

export const bookingStatusLabels: Record<BookingStatus, string> = {
  pending_review: "Pendiente de revisión",
  approved: "Aprobada",
  rejected: "Rechazada",
  cancelled: "Cancelada",
};

export const rejectionReasons = [
  "Comprobante no válido",
  "Datos incompletos",
  "Información inconsistente",
  "Incumplimiento de requisitos o políticas de participación.",
  "Fecha sin disponibilidad",
  "Otro",
] as const;
