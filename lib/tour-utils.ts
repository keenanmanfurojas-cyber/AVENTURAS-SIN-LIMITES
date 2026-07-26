import { siteConfig } from "@/lib/site-config";
import type { Tour } from "@/types/content";

type Currency = "CRC" | "USD";

const currencyFormats: Record<
  Currency,
  { groupSeparator: string; symbol: string }
> = {
  CRC: { groupSeparator: ".", symbol: "₡" },
  USD: { groupSeparator: ",", symbol: "$" },
};

export function formatCurrency(amount: number, currency: Currency) {
  const { groupSeparator, symbol } = currencyFormats[currency];
  const roundedAmount = Math.round(amount);
  const sign = roundedAmount < 0 ? "-" : "";
  const digits = Math.abs(roundedAmount).toString();
  const groupedDigits = digits.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);

  return `${sign}${symbol}${groupedDigits}`;
}

export function formatCrc(amount: number) {
  return formatCurrency(amount, "CRC");
}

export function formatUsd(amount: number) {
  return formatCurrency(amount, "USD");
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
