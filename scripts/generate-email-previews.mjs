import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const { renderPremiumBookingEmail } = await import(
  "../lib/notifications/email-design.ts"
);

const outputDirectory = resolve("docs/email-previews");
await mkdir(outputDirectory, { recursive: true });

const common = {
  appUrl: "https://aventuras-sin-limites.vercel.app",
  code: "ASL-CE-DEMO7",
  details: [
    { label: "Tour", value: "Tour Ciudad Esmeralda" },
    { label: "Fecha", value: "30 de agosto de 2026" },
    { label: "Participantes", value: "2 personas" },
    { label: "Total", value: "₡70 000" },
  ],
  heroUrl:
    "../../public/images/tours/CIUDAD%20ESMERALDA/ciudad-esmeralda.webp",
  logoUrl: "../../public/images/brand/logo-aventuras-sin-limites.png",
};

const previews = [
  {
    filename: "solicitud-recibida.html",
    input: {
      ...common,
      actions: [
        { href: "#mi-reserva", label: "Consultar Mi Reserva" },
        {
          href: "#whatsapp",
          label: "Contactar por WhatsApp",
          secondary: true,
        },
      ],
      badge: "Solicitud recibida",
      badgeColor: "#b9ff4a",
      eyebrow: "Solicitud registrada correctamente",
      heading: "Tu aventura comienza aquí",
      intro:
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
  },
  {
    filename: "reserva-confirmada.html",
    input: {
      ...common,
      actions: [
        { href: "#mi-reserva", label: "Consultar Mi Reserva" },
        {
          href: "#recibo",
          label: "Descargar recibo",
          secondary: true,
        },
        {
          href: "#whatsapp",
          label: "Contactar por WhatsApp",
          secondary: true,
        },
      ],
      badge: "Expedición confirmada",
      badgeColor: "#b9ff4a",
      details: [
        {
          featured: true,
          label: "Tour",
          value: "Tour Ciudad Esmeralda",
        },
        {
          featured: true,
          label: "Fecha",
          value: "30 de agosto de 2026",
        },
        { label: "Participantes", value: "2 personas" },
        { label: "Total", value: "₡70 000" },
      ],
      eyebrow: "Adventure pass listo",
      heading: "Tu aventura está confirmada",
      intro:
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
  },
  {
    filename: "revision-comprobante.html",
    input: {
      ...common,
      actions: [
        { href: "#mi-reserva", label: "Consultar Mi Reserva" },
        {
          href: "#whatsapp",
          label: "Contactar por WhatsApp",
          secondary: true,
        },
      ],
      badge: "Ajuste rápido",
      badgeColor: "#d9bd8b",
      callout: {
        label: "¿Qué necesitamos corregir?",
        text: "La imagen del comprobante no permite leer con claridad la referencia del pago. Envíanos una fotografía más nítida y te ayudaremos a continuar.",
      },
      eyebrow: "Sigamos preparando tu expedición",
      heading: "Estamos a un paso de confirmar tu aventura",
      intro:
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
  },
];

for (const preview of previews) {
  await writeFile(
    resolve(outputDirectory, preview.filename),
    renderPremiumBookingEmail(preview.input),
    "utf8",
  );
}

console.log(`Generated ${previews.length} static email previews.`);
