import "server-only";

import type { BookingRepository } from "@/lib/bookings/repository";
import { BookingRepositoryError } from "@/lib/bookings/errors";
import { SupabaseBookingRepository } from "@/lib/bookings/supabase-repository";
import { hasSupabaseAdminEnv } from "@/lib/supabase/admin";

function createUnavailableRepository(): BookingRepository {
  return new Proxy({} as BookingRepository, {
    get() {
      return async () => {
        throw new BookingRepositoryError(
          "configuration_missing",
          "Configura las variables privadas de Supabase en el servidor.",
        );
      };
    },
  });
}

function createBookingRepository(): BookingRepository {
  if (hasSupabaseAdminEnv()) return new SupabaseBookingRepository();
  return createUnavailableRepository();
}

export const bookingRepository = createBookingRepository();

/*
 * Supabase es la única persistencia activa. Si faltan variables, las rutas
 * fallan de forma controlada y nunca simulan una reserva local exitosa.
 */
