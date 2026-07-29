import type { BookingRecord } from "@/types/booking";
import { formatBookingDate } from "@/lib/booking-date";
import { formatCrc } from "@/lib/tour-utils";
import { siteConfig } from "@/lib/site-config";
import {
  renderPremiumBookingEmail,
  type EmailProgressStep,
} from "@/lib/notifications/email-design";

export type BookingNotificationEvent =
  | "booking_approved"
  | "booking_received"
  | "booking_rejected";

type BookingEmailOptions = {
  receiptUrl?: string;
};

export function createBookingEmail(
  record: BookingRecord,
  event: BookingNotificationEvent,
  options: BookingEmailOptions = {},
) {
  const statusCopy = {
    booking_received: {
      badge: "Solicitud recibida",
      badgeColor: "#b9ff4a",
      eyebrow: "Solicitud registrada correctamente",
      heading: "Tu aventura comienza aquí",
      subject: `Solicitud recibida · ${record.bookingCode}`,
      message:
        "Recibimos correctamente tu solicitud. Nuestro equipo está verificando el comprobante y te enviaremos otro correo cuando la reserva sea aprobada.",
      nextSteps: [
        "Guarda este correo como referencia de tu solicitud.",
        "Revisa tu bandeja principal, promociones y spam para no perder la confirmación.",
        "Consulta Mi Reserva en cualquier momento para conocer el estado actualizado.",
      ],
      progress: [
        { label: "Solicitud recibida", state: "active" },
        { label: "Verificación", state: "muted" },
        { label: "Confirmación", state: "muted" },
      ],
    },
    booking_approved: {
      badge: "Expedición confirmada",
      badgeColor: "#b9ff4a",
      eyebrow: "Adventure pass listo",
      heading: "Tu aventura está confirmada",
      subject: `Reserva confirmada · ${record.bookingCode}`,
      message:
        "Tu pago fue validado y tu lugar está asegurado. Prepárate: la expedición ya tiene fecha.",
      nextSteps: [
        "Descarga y conserva tu Adventure Pass o recibo de confirmación.",
        "Revisa fecha, tour y participantes antes de la salida.",
        "Escríbenos por WhatsApp si necesitas recomendaciones o coordinar detalles.",
      ],
      progress: [
        { label: "Solicitud recibida", state: "complete" },
        { label: "Verificación", state: "complete" },
        { label: "Confirmación", state: "active" },
      ],
    },
    booking_rejected: {
      badge: "Ajuste rápido",
      badgeColor: "#d9bd8b",
      eyebrow: "Sigamos preparando tu expedición",
      heading: "Estamos a un paso de confirmar tu aventura",
      subject: `Revisión de comprobante · ${record.bookingCode}`,
      message:
        "Solo necesitamos ajustar un detalle del comprobante para continuar con la confirmación.",
      nextSteps: [
        "Revisa qué necesitamos corregir en el aviso incluido.",
        "Escríbenos por WhatsApp y te ayudaremos a resolverlo.",
        "Conserva tu código: seguirá siendo la referencia de esta solicitud.",
      ],
      progress: [
        { label: "Solicitud recibida", state: "complete" },
        { label: "Ajuste rápido", state: "warning" },
        { label: "Confirmación", state: "muted" },
      ],
    },
  }[event];
  const appUrl = (process.env.APP_URL ?? "").replace(/\/$/, "");
  const lookupUrl = `${appUrl}/mi-reserva?codigo=${encodeURIComponent(record.bookingCode)}`;
  const whatsappMessage = `Hola, necesito ayuda con mi reserva ${record.bookingCode}.`;
  const whatsappUrl = `${siteConfig.contact.whatsapp.baseUrl}?text=${encodeURIComponent(whatsappMessage)}`;
  const actions = [
    { href: lookupUrl, label: "Consultar Mi Reserva" },
    {
      href: whatsappUrl,
      label: "Contactar por WhatsApp",
      secondary: true,
    },
  ];
  if (event === "booking_approved" && options.receiptUrl) {
    actions.splice(1, 0, {
      href: options.receiptUrl,
      label: "Descargar recibo",
      secondary: true,
    });
  }
  const details = [
    {
      featured: event === "booking_approved",
      label: "Tour",
      value: record.tourName,
    },
    {
      featured: event === "booking_approved",
      label: "Fecha",
      value: formatBookingDate(record.selectedDate),
    },
    {
      label: "Participantes",
      value: String(record.quantity),
    },
    { label: "Total", value: formatCrc(record.total) },
  ];

  return {
    html: renderPremiumBookingEmail({
      actions,
      appUrl,
      badge: statusCopy.badge,
      badgeColor: statusCopy.badgeColor,
      callout:
        event === "booking_rejected"
          ? {
              label: "¿Qué necesitamos corregir?",
              text:
                record.rejectionReason?.trim() ||
                "Necesitamos una imagen más clara del comprobante para verificar los datos.",
            }
          : undefined,
      code: record.bookingCode,
      details,
      eyebrow: statusCopy.eyebrow,
      heading: statusCopy.heading,
      heroUrl: `${appUrl}/images/tours/CIUDAD%20ESMERALDA/ciudad-esmeralda.webp`,
      intro: statusCopy.message,
      logoUrl: `${appUrl}/images/brand/logo-aventuras-sin-limites.png`,
      nextSteps: statusCopy.nextSteps,
      progress: statusCopy.progress as EmailProgressStep[],
    }),
    subject: statusCopy.subject,
    text: `${statusCopy.heading}\n${statusCopy.message}\n\nCódigo: ${record.bookingCode}\nTour: ${record.tourName}\nFecha: ${formatBookingDate(record.selectedDate)}\nParticipantes: ${record.quantity}\nTotal: ${formatCrc(record.total)}\n\n¿Qué sigue?\n${statusCopy.nextSteps.map((step) => `- ${step}`).join("\n")}\n\nMi Reserva: ${lookupUrl}\nWhatsApp: ${whatsappUrl}${event === "booking_approved" && options.receiptUrl ? `\nRecibo: ${options.receiptUrl}` : ""}\n\nConserva este correo y tu código.\nAventuras Sin Límites`,
  };
}
