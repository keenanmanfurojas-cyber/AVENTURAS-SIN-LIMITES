/**
 * Configuración operativa pública y no secreta del sistema.
 *
 * Los secretos y credenciales deben permanecer exclusivamente en variables de
 * entorno del servidor.
 */
export const BUSINESS_TIMEZONE = "America/Costa_Rica";
export const ADMIN_NOTIFICATION_EMAIL =
  "aventurassinlimites.cr@gmail.com";
export const WHATSAPP_NUMBER = "+50663895974";
export const SINPE_NUMBER = "+50660582400";
export const SINPE_ACCOUNT_HOLDER = "Keenan Manfu R.";
export const PRIVATE_TOURS_PER_DAY = 1;

export const systemConfig = {
  adminNotificationEmail: ADMIN_NOTIFICATION_EMAIL,
  businessTimezone: BUSINESS_TIMEZONE,
  privateToursPerDay: PRIVATE_TOURS_PER_DAY,
  sinpeAccountHolder: SINPE_ACCOUNT_HOLDER,
  sinpeNumber: SINPE_NUMBER,
  whatsappNumber: WHATSAPP_NUMBER,
} as const;
