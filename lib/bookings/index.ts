import "server-only";

import { LocalBookingRepository } from "@/lib/bookings/local-repository";

// DEMO LOCAL: este único punto de composición permite sustituir el repositorio
// por Supabase sin modificar el formulario ni el panel.
export const bookingRepository = new LocalBookingRepository();

/*
 * PRODUCCIÓN REQUIERE: autenticación robusta, base de datos, almacenamiento
 * privado de comprobantes, reglas de acceso/RLS, respaldos y un aviso de
 * privacidad y tratamiento de datos personales y médicos.
 */
