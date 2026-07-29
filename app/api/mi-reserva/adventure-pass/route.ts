import { NextResponse } from "next/server";
import { z } from "zod";

import {
  AdventurePassPdfError,
  generateAdventurePassPdf,
} from "@/lib/adventure-pass-pdf";
import { verifyBookingLookupToken } from "@/lib/booking-lookup-token";
import { bookingRepository } from "@/lib/bookings";
import { findPublicBooking } from "@/lib/public-booking-lookup";

export const maxDuration = 60;
export const runtime = "nodejs";

const requestSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^ASL-CE-[A-HJ-NP-Z2-9]{5}$/),
  token: z.string().trim().min(20).max(500),
});

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Solicitud no permitida." }, { status: 403 });
  }
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (
    !parsed.success ||
    !verifyBookingLookupToken(parsed.data.code, parsed.data.token)
  ) {
    return NextResponse.json({ error: "Acceso no válido." }, { status: 403 });
  }

  try {
    const publicBooking = await findPublicBooking(
      request,
      parsed.data.code,
      undefined,
      parsed.data.token,
    );
    if (!publicBooking || publicBooking.status !== "approved") {
      return NextResponse.json(
        { error: "El Adventure Pass todavía no está disponible." },
        { status: 404 },
      );
    }
    const booking = await bookingRepository.getBookingByCode(parsed.data.code);
    if (!booking || booking.status !== "approved") {
      return NextResponse.json(
        { error: "El Adventure Pass todavía no está disponible." },
        { status: 404 },
      );
    }
    const baseUrl = new URL(request.url).origin;
    const publicBaseUrl = (process.env.APP_URL || baseUrl).replace(/\/$/, "");
    const lookupUrl = `${publicBaseUrl}/mi-reserva?codigo=${encodeURIComponent(booking.bookingCode)}&acceso=${encodeURIComponent(parsed.data.token)}`;
    const pdf = await generateAdventurePassPdf(booking, {
      baseUrl,
      lookupUrl,
    });
    return new NextResponse(pdf, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="adventure-pass-${booking.bookingCode}.pdf"`,
        "Content-Type": "application/pdf",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "LOOKUP_RATE_LIMITED") {
      return NextResponse.json(
        { error: "Demasiadas descargas. Espera 15 minutos." },
        { status: 429 },
      );
    }
    if (error instanceof AdventurePassPdfError) {
      const message =
        error.code === "timeout"
          ? "La generación está tardando más de lo esperado. Inténtalo de nuevo."
          : error.code === "resource_failed"
            ? "No pudimos cargar todos los recursos del pase. Inténtalo de nuevo."
            : error.code === "browser_unavailable"
              ? "La descarga no está disponible temporalmente."
              : "No fue posible generar el Adventure Pass. Inténtalo de nuevo.";
      const status = error.code === "timeout" ? 504 : 503;
      console.error("Adventure Pass PDF failed.", error.code);
      return NextResponse.json({ error: message }, { status });
    }
    return NextResponse.json(
      { error: "No fue posible generar el Adventure Pass." },
      { status: 503 },
    );
  }
}
