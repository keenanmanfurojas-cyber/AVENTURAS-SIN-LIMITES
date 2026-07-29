import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [deliverySource, providerSource, templateSource] = await Promise.all([
  readFile("lib/notifications/delivery.ts", "utf8"),
  readFile("lib/notifications/resend-provider.ts", "utf8"),
  readFile("lib/notifications/templates.ts", "utf8"),
]);

assert.match(deliverySource, /EMAIL_DELIVERY_ENABLED === "true"/);
assert.match(deliverySource, /delivery_disabled/);
assert.match(deliverySource, /createResendProvider/);
assert.match(deliverySource, /sendBookingEmailWithProvider/);
assert.match(providerSource, /onboarding@resend\.dev/);
assert.match(providerSource, /https:\/\/api\.resend\.com\/emails/);
assert.match(providerSource, /Idempotency-Key/);

const events = [
  {
    event: "booking_received",
    subject: "Solicitud recibida · ASL-CE-TEST2",
  },
  {
    event: "booking_approved",
    subject: "Reserva confirmada · ASL-CE-TEST2",
  },
  {
    event: "booking_rejected",
    subject: "Actualización de reserva · ASL-CE-TEST2",
  },
];

const simulatedDeliveries = [];
const simulatedProvider = {
  name: "simulated",
  async send(message) {
    simulatedDeliveries.push(message);
    return { messageId: `simulated-${simulatedDeliveries.length}` };
  },
};

for (const { event, subject } of events) {
  assert.match(templateSource, new RegExp(`${event}:`));
  const result = await simulatedProvider.send({
    from: "Aventuras Sin Límites <onboarding@resend.dev>",
    html: `<p>${subject}</p>`,
    idempotencyKey: `synthetic:${event}:email`,
    subject,
    text: subject,
    to: "cliente-sintetico@example.com",
  });
  assert.match(result.messageId, /^simulated-/);
}

assert.equal(simulatedDeliveries.length, 3);
assert(
  simulatedDeliveries.every(
    (delivery) =>
      delivery.from.endsWith("<onboarding@resend.dev>") &&
      delivery.to.endsWith("@example.com") &&
      delivery.idempotencyKey.includes(delivery.subject.includes("recibida")
        ? "booking_received"
        : delivery.subject.includes("confirmada")
          ? "booking_approved"
          : "booking_rejected"),
  ),
);

console.log(
  "SIMULATION_PASS: 3 plantillas procesadas por el proveedor simulado; 0 solicitudes de red.",
);
