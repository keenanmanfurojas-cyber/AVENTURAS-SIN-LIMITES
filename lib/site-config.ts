import {
  ADMIN_NOTIFICATION_EMAIL,
  SINPE_ACCOUNT_HOLDER,
  SINPE_NUMBER,
  WHATSAPP_NUMBER,
} from "@/lib/system-config";

const whatsappDigits = WHATSAPP_NUMBER.replace(/^\+/, "");
const sinpeDigits = SINPE_NUMBER.replace(/^\+/, "");

export const siteConfig = {
  name: "Aventuras Sin Límites",
  namePrimary: "Aventuras",
  nameAccent: "Sin Límites",
  brandLine: "By Keenan Adventures CR",
  responsiblePerson: "Keenan Manfú Rojas",
  eyebrow: "Costa Rica · Naturaleza sin fronteras",
  introCta: "Explorar",
  contact: {
    whatsapp: {
      displayNumber: "+506 6389-5974",
      digits: whatsappDigits,
      baseUrl: `https://wa.me/${whatsappDigits}`,
      defaultMessage:
        "Hola, deseo recibir información sobre las experiencias de Aventuras Sin Límites.",
      href: "https://wa.me/50663895974?text=Hola%2C%20deseo%20recibir%20informaci%C3%B3n%20sobre%20las%20experiencias%20de%20Aventuras%20Sin%20L%C3%ADmites.",
    },
    email: {
      address: ADMIN_NOTIFICATION_EMAIL,
      href: `mailto:${ADMIN_NOTIFICATION_EMAIL}`,
    },
    location: "San Carlos, Costa Rica",
    operationArea:
      "La Fortuna y Ciudad Quesada, San Carlos, Costa Rica",
  },
  payments: {
    sinpe: {
      displayNumber: "+506 6058-2400",
      digits: sinpeDigits,
      holder: SINPE_ACCOUNT_HOLDER,
    },
  },
} as const;
