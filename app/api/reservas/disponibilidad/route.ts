import { NextResponse } from "next/server";

import { bookingRepository } from "@/lib/bookings";
import { safeBookingErrorMessage } from "@/lib/bookings/errors";
import {
  isCiudadEsmeraldaBookingIdentifier,
  isTourComingSoon,
} from "@/lib/tours-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const date = params.get("date");
  const tourSlug = params.get("tourSlug");

  try {
    if (date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json({ error: "Fecha no válida." }, { status: 400 });
      }
      return NextResponse.json({
        availability: await bookingRepository.getPrivateAvailability(date),
      });
    }
    if (tourSlug) {
      if (isTourComingSoon(tourSlug)) {
        return NextResponse.json(
          { error: "Este tour estará disponible muy pronto." },
          { status: 409 },
        );
      }
      if (!isCiudadEsmeraldaBookingIdentifier(tourSlug)) {
        return NextResponse.json(
          { error: "Tour no disponible." },
          { status: 404 },
        );
      }
      return NextResponse.json({
        dates: await bookingRepository.getGroupTourDates(tourSlug),
      });
    }
    return NextResponse.json(
      { error: "Indica una fecha o un tour." },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: safeBookingErrorMessage(error) },
      { status: 503 },
    );
  }
}
