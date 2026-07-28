const monthNames = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

export function parseBookingDate(date: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;
  return {
    day: Number(match[3]),
    month: Number(match[2]),
    year: Number(match[1]),
  };
}

export function formatBookingDate(date: string) {
  if (!date) return "Pendiente";
  const parts = parseBookingDate(date);
  if (!parts || !monthNames[parts.month - 1]) return date;
  return `${parts.day} de ${monthNames[parts.month - 1]} de ${parts.year}`;
}
