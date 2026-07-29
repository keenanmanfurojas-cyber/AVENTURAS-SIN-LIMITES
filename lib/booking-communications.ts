import { formatBookingDate } from "@/lib/booking-date";
import { formatCrc } from "@/lib/tour-utils";
import { phoneDigitsForWhatsApp, phoneIsValid } from "@/lib/contact-validation";
import type { BookingRecord } from "@/types/booking";

export function createApprovalMessage(record: BookingRecord) {
  return `Hola ${record.buyer.fullName}. Tu reserva ${record.bookingCode} con Aventuras Sin Límites fue aprobada.\n\nTour: ${record.tourName}\nFecha: ${formatBookingDate(record.selectedDate)}\nParticipantes: ${record.quantity}\nMonto: ${formatCrc(record.total)}\n\nConserva tu código y consulta el estado en la sección “Mi reserva”.`;
}

export function createRejectionMessage(record: BookingRecord) {
  const reason = record.rejectionReason?.trim()
    ? `\nMotivo: ${record.rejectionReason.trim()}`
    : "";
  return `Hola ${record.buyer.fullName}. La solicitud ${record.bookingCode} requiere atención y no pudo ser confirmada.${reason}\n\nEscríbenos para revisar la información o corregir el comprobante de pago.`;
}

export function getBookingCommunication(record: BookingRecord) {
  const message =
    record.status === "approved"
      ? createApprovalMessage(record)
      : createRejectionMessage(record);
  const digits = phoneDigitsForWhatsApp(record.buyer.phone);
  return {
    message,
    phoneIsValid: phoneIsValid(record.buyer.phone),
    whatsappUrl: digits
      ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
      : null,
  };
}
