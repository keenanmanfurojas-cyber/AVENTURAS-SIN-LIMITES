import { siteConfig } from "@/lib/site-config";
import {
  SINPE_ACCOUNT_HOLDER,
  SINPE_NUMBER,
} from "@/lib/system-config";
import { tours } from "@/lib/tours-data";
import type { BookingConfig } from "@/types/booking";

const gamTour = tours.find(
  (tour) => tour.slug === "canon-ciudad-esmeralda-transporte-gam",
);

if (!gamTour) {
  throw new Error("Falta la configuración de precios de Ciudad Esmeralda.");
}

export const ciudadEsmeraldaBookingConfig: BookingConfig = {
  availableDates: [
    {
      date: "2026-07-26",
      capacity: 12,
      availableSpots: 0,
      status: "sold_out",
      temporary: false,
    },
    {
      date: "2026-08-23",
      capacity: 12,
      availableSpots: 0,
      status: "sold_out",
      temporary: false,
    },
    {
      date: "2026-08-30",
      capacity: 12,
      availableSpots: 12,
      status: "available",
      temporary: false,
    },
    {
      date: "2026-09-20",
      capacity: 12,
      availableSpots: 11,
      status: "available",
      temporary: false,
    },
    {
      date: "2026-10-25",
      capacity: 12,
      availableSpots: 12,
      status: "available",
      temporary: false,
    },
  ],
  tourId: "ciudad-esmeralda",
  tourName: "Tour Ciudad Esmeralda",
  sinpeNumber: SINPE_NUMBER,
  sinpeAccountHolder: SINPE_ACCOUNT_HOLDER,
  storageKey: "asl-booking-draft-ciudad-esmeralda",
  whatsappBaseUrl: siteConfig.contact.whatsapp.baseUrl,
  privateMealExtraCrc: 5500,
  modes: [
    {
      id: "gam_transport",
      label: "Tour grupal con transporte desde la GAM",
      description:
        "Incluye transporte ida y regreso desde puntos de salida definidos.",
      minimumParticipants: 1,
      pricePerPersonCrc: gamTour.priceCrc,
    },
    {
      id: "private",
      label: "Tour privado con llegada al punto de encuentro",
      description:
        "Experiencia privada con llegada por cuenta propia, disponible para una persona o grupos.",
      minimumParticipants: 1,
      pricePerPersonCrc: 28000,
      singleParticipantPriceCrc: 35000,
    },
  ],
};

export const ciudadEsmeraldaDeparturePoints = [
  "San José — Teatro Nacional — 4:50 a. m.",
  "Heredia — Oxígeno — 5:15 a. m.",
  "Alajuela — Rosti Casino — 5:30 a. m.",
  "Entronque Grecia — 5:50 a. m.",
] as const;
