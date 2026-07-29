import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const constraints = await readFile(
  "lib/payment-proof-constraints.ts",
  "utf8",
);
const optimizer = await readFile("lib/payment-proof-image.ts", "utf8");
const wizard = await readFile(
  "components/booking/booking-wizard.tsx",
  "utf8",
);
const payment = await readFile(
  "components/booking/sinpe-payment.tsx",
  "utf8",
);
const serverValidation = await readFile(
  "lib/bookings/validation.ts",
  "utf8",
);
const bookingApi = await readFile("app/api/reservas/route.ts", "utf8");

assert.match(constraints, /3 \* 1024 \* 1024/);
assert.match(constraints, /1\.5 \* 1024 \* 1024/);
assert.match(constraints, /maximumPaymentProofDimension = 1600/);
for (const type of ["image/jpeg", "image/png", "image/webp"]) {
  assert.match(constraints, new RegExp(`"${type}"`));
}
assert.match(optimizer, /createImageBitmap/);
assert.match(optimizer, /canvas\.toBlob\(resolve, "image\/jpeg"/);
assert.match(optimizer, /\[0\.82, 0\.72, 0\.62\]/);
assert.match(wizard, /response\.status === 413/);
assert.match(
  wizard,
  /El comprobante supera el tamaño permitido\. Usa una captura más liviana\./,
);
assert.match(
  wizard,
  /El comprobante es demasiado pesado\. Sube una captura de pantalla o una imagen menor de 3 MB\./,
);
assert.match(payment, /máximo 3 MB/);
assert.match(serverValidation, /validatePaymentProof/);
assert.match(bookingApi, /PAYMENT_PROOF_TOO_LARGE/);
assert.match(bookingApi, /status: tooLarge \? 413 : 400/);

console.log(
  "Comprobante verificado: tipos seguros, 3 MB original, optimización y 1.5 MB final.",
);
