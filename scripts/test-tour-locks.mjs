import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const toursData = await readFile("lib/tours-data.ts", "utf8");
const card = await readFile("components/tours/tour-card.tsx", "utf8");
const page = await readFile("app/tours/[slug]/page.tsx", "utf8");
const bookingApi = await readFile("app/api/reservas/route.ts", "utf8");
const availabilityApi = await readFile(
  "app/api/reservas/disponibilidad/route.ts",
  "utf8",
);
const styles = await readFile("app/globals.css", "utf8");

for (const slug of [
  "amanecer-volcan-platanar-sin-transporte",
  "amanecer-volcan-platanar-transporte-gam",
  "entre-volcanes-guatemala",
]) {
  assert.match(toursData, new RegExp(`"${slug}"`));
}
assert.match(toursData, /comingSoonTourSlugs/);
assert.match(toursData, /"volcán de fuego"/);
assert.match(toursData, /isCiudadEsmeraldaBookingIdentifier/);
assert.match(toursData, /"ciudad-esmeralda"/);
assert.match(card, /Disponible muy pronto/);
assert.match(card, /aria-disabled="true"/);
assert.match(card, /comingSoon \? \(/);
assert.match(page, /redirect\("\/explorar#tours"\)/);
assert.match(bookingApi, /submittedTours\.some/);
assert.match(bookingApi, /\["tourSlug", "tourId", "tourName"\]/);
assert.match(bookingApi, /status: 409/);
assert.match(availabilityApi, /isTourComingSoon\(tourSlug\)/);
assert.match(styles, /tour-coming-soon-ribbon::after/);
assert.match(styles, /@keyframes tour-ribbon-shine/);
assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);

console.log(
  "Bloqueo de tours verificado: catálogo, rutas, API, cinta y movimiento reducido.",
);
