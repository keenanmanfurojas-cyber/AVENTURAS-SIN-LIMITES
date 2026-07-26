import "server-only";

import { LocalBookingRepository } from "@/lib/bookings/local-repository";
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
  if (process.env.NODE_ENV === "development") {
    // Fallback development-only. Nunca se usa durante producción.
    return new LocalBookingRepository();
  }
  return createUnavailableRepository();
}

export const bookingRepository = createBookingRepository();

/*
 * PRODUCCIÓN REQUIERE: autenticación robusta, base de datos, almacenamiento
 * privado de comprobantes, reglas de acceso/RLS, respaldos y un aviso de
 * privacidad y tratamiento de datos personales y médicos.
 */
