import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const contact = await import("../lib/contact-validation.ts");
const lookupUi = await readFile("components/booking/my-booking.tsx", "utf8");
const lookupApi = await readFile("app/api/mi-reserva/route.ts", "utf8");
const adminMessages = await readFile(
  "lib/booking-communications.ts",
  "utf8",
);
const receipt = await readFile(
  "app/api/admin/reservas/[id]/recibo/route.ts",
  "utf8",
);
const adventurePassApi = await readFile(
  "app/api/mi-reserva/adventure-pass/route.ts",
  "utf8",
);
const adventurePassPdf = await readFile(
  "lib/adventure-pass-pdf.ts",
  "utf8",
);
const adventurePassPrint = await readFile(
  "app/design/adventure-pass/print/page.tsx",
  "utf8",
);

const syntheticBooking = {
  bookingCode: "ASL-CE-TEST2",
  createdAt: "2026-07-28T12:00:00.000Z",
  mode: "direct",
  paymentStatus: "pending_review",
  quantity: 2,
  selectedDate: "2026-08-20",
  total: 70000,
  tourName: "Ciudad Esmeralda",
};

assert.equal(contact.phoneIsValid("8888-8888", "+506"), true);
assert.equal(contact.normalizePhoneToE164("8888-8888", "+506"), "+50688888888");
assert.equal(contact.phoneIsValid("+502 5555 5555"), true);
assert.equal(contact.phoneIsValid("12-ab"), false);
assert.equal(contact.emailIsValid("cliente@example.com"), true);
assert.equal(contact.emailIsValid("cliente@"), false);
assert.equal(
  contact.normalizeEmail("cliente@example.com") ===
    contact.normalizeEmail("otro@example.com"),
  false,
);

for (const status of ["pending_review", "approved", "rejected"]) {
  const record = { ...syntheticBooking, status };
  assert.equal(record.bookingCode, "ASL-CE-TEST2");
  assert.match(lookupUi, new RegExp(`${status}:`));
}

assert.match(lookupUi, /initialCode && token/);
assert.match(lookupUi, /email: accessToken \? undefined : email/);
assert.match(lookupApi, /!parsed\.data\.token/);
assert.match(lookupApi, /No encontramos una reserva con esos datos/);
assert.match(adminMessages, /wa\.me/);
assert.match(adminMessages, /Motivo:/);
assert.match(receipt, /Identificador verificable/);
assert.match(receipt, /window\.print/);
assert.match(adventurePassApi, /verifyBookingLookupToken/);
assert.match(adventurePassApi, /findPublicBooking/);
assert.match(adventurePassApi, /LOOKUP_RATE_LIMITED/);
assert.match(adventurePassApi, /booking\.status !== "approved"/);
assert.match(adventurePassApi, /adventure-pass-\$\{booking\.bookingCode\}\.pdf/);
assert.doesNotMatch(adventurePassApi, /target_booking_id|buyer_id/);
assert.match(adventurePassPdf, /QRCode\.toDataURL/);
assert.match(adventurePassPdf, /lookupUrl/);
assert.match(adventurePassPdf, /@sparticuz\/chromium/);
assert.match(adventurePassPdf, /browser_unavailable/);
assert.match(adventurePassPdf, /resource_failed/);
assert.match(adventurePassPdf, /empty_pdf/);
assert.match(adventurePassPdf, /invalid_pdf/);
assert.match(adventurePassPdf, /generationTimeoutMs/);
assert.match(adventurePassPdf, /x-asl-adventure-pass-render/);
assert.doesNotMatch(adventurePassPdf, /print\?token=/);
assert.match(adventurePassPrint, /x-asl-adventure-pass-render/);
assert.doesNotMatch(adventurePassPrint, /searchParams/);
assert.match(adventurePassApi, /AdventurePassPdfError/);
assert.doesNotMatch(adventurePassApi, /json\(\{\s*error:\s*error\.message/);
assert.match(lookupUi, /booking\.status === "approved"/);
assert.match(lookupUi, /Descargar Adventure Pass/);
assert.doesNotMatch(lookupUi, /paymentProof|buyer\.|participants|medical/i);

console.log(
  "Experiencia de cliente verificada: recuperación, estados, contacto, WhatsApp y recibo (datos sintéticos).",
);
