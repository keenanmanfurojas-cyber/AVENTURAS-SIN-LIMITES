import { siteConfig } from "@/lib/site-config";
import type { Tour } from "@/types/content";

export function formatCrc(amount: number) {
  return `₡${new Intl.NumberFormat("es-CR", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

export function getTourWhatsAppUrl(tour: Tour) {
  return `${siteConfig.contact.whatsapp.baseUrl}?text=${encodeURIComponent(
    tour.whatsappMessage,
  )}`;
}

export function getMapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query,
  )}`;
}
