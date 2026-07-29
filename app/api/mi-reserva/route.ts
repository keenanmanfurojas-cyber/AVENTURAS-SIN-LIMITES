import { NextResponse } from "next/server";
import { z } from "zod";

import { emailIsValid } from "@/lib/contact-validation";
import {
  createBookingLookupToken,
  lookupProtectionIsConfigured,
} from "@/lib/booking-lookup-token";
import { findPublicBooking } from "@/lib/public-booking-lookup";

export const runtime = "nodejs";

const lookupSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^ASL-CE-[A-HJ-NP-Z2-9]{5}$/),
  email: z.string().trim().max(254).optional(),
  token: z.string().trim().max(500).optional(),
});

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Solicitud no permitida." }, { status: 403 });
  }
  if (!lookupProtectionIsConfigured()) {
    return NextResponse.json(
      { error: "La consulta de reservas no está disponible temporalmente." },
      { status: 503 },
    );
  }

  const parsed = lookupSchema.safeParse(await request.json().catch(() => null));
  if (
    !parsed.success ||
    (!parsed.data.token &&
      (!parsed.data.email || !emailIsValid(parsed.data.email)))
  ) {
    return NextResponse.json(
      { error: "Ingresa un código y correo válidos." },
      { status: 400 },
    );
  }

  try {
    const booking = await findPublicBooking(
      request,
      parsed.data.code,
      parsed.data.email,
      parsed.data.token,
    );
    if (!booking) {
      return NextResponse.json(
        { error: "No encontramos una reserva con esos datos." },
        { status: 404 },
      );
    }
    const accessToken =
      parsed.data.token ||
      createBookingLookupToken(parsed.data.code, parsed.data.email!);
    return NextResponse.json(
      { accessToken, booking },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "LOOKUP_RATE_LIMITED") {
      return NextResponse.json(
        { error: "Demasiados intentos. Espera 15 minutos." },
        { status: 429 },
      );
    }
    return NextResponse.json(
      { error: "No fue posible consultar la reserva." },
      { status: 503 },
    );
  }
}
