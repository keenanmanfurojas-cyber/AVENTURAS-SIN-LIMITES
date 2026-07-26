import { BUSINESS_TIMEZONE } from "@/lib/system-config";

const costaRicaDateFormatter = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  month: "2-digit",
  timeZone: BUSINESS_TIMEZONE,
  year: "numeric",
});

export function getCostaRicaDateString(date = new Date()) {
  const parts = costaRicaDateFormatter.formatToParts(date);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
}
