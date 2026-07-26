import type { AvailableDate, BookingErrors } from "@/types/booking";

const statusLabels = {
  available: "Disponible",
  low: "Pocos cupos",
  sold_out: "Agotado",
} as const;

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
const weekdayNames = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
] as const;

function parseBookingDate(date: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;
  return {
    day: Number(match[3]),
    month: Number(match[2]),
    year: Number(match[1]),
  };
}

function formatBookingWeekday(date: string) {
  const parts = parseBookingDate(date);
  if (!parts) return "";
  const offsets = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  const adjustedYear = parts.month < 3 ? parts.year - 1 : parts.year;
  const weekday =
    (adjustedYear +
      Math.floor(adjustedYear / 4) -
      Math.floor(adjustedYear / 100) +
      Math.floor(adjustedYear / 400) +
      offsets[parts.month - 1] +
      parts.day) %
    7;
  return weekdayNames[weekday];
}

export function formatBookingDate(date: string) {
  if (!date) return "Pendiente";
  const parts = parseBookingDate(date);
  if (!parts || !monthNames[parts.month - 1]) return date;
  return `${parts.day} de ${monthNames[parts.month - 1]} de ${parts.year}`;
}

export function BookingDateSelector({
  dates,
  errors,
  onChange,
  selectedDate,
}: Readonly<{
  dates: AvailableDate[];
  errors: BookingErrors;
  onChange: (date: string) => void;
  selectedDate: string;
}>) {
  const orderedDates = [...dates].sort((first, second) => {
    const firstSoldOut =
      first.status === "sold_out" || first.availableSpots === 0;
    const secondSoldOut =
      second.status === "sold_out" || second.availableSpots === 0;

    return Number(firstSoldOut) - Number(secondSoldOut);
  });

  return (
    <div>
      <p className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[#b9ff4a]">
        Fecha del tour
      </p>
      <h3 className="mt-3 font-[family-name:var(--font-manrope)] text-2xl font-extrabold tracking-[-0.03em] text-white sm:text-3xl">
        ¿Cuándo quieres vivir la experiencia?
      </h3>
      <p className="mt-3 text-sm leading-7 text-stone-400">
        Elige una de las fechas habilitadas para Ciudad Esmeralda.
      </p>
      {dates.some((date) => date.temporary) ? (
        <p className="mt-4 rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-4 py-2 text-xs text-amber-200">
          Fechas temporales de demostración; serán reemplazadas por las fechas reales.
        </p>
      ) : null}
      <div
        className="mt-7 grid gap-3 sm:grid-cols-2"
        data-error={Boolean(errors.selectedDate)}
      >
        {orderedDates.map((item) => {
          const disabled = item.status === "sold_out" || item.availableSpots === 0;
          const selected = selectedDate === item.date;
          const availabilityPercentage = Math.max(
            0,
            Math.min(100, (item.availableSpots / item.capacity) * 100),
          );
          return (
            <button
              aria-pressed={selected}
              className={`rounded-[1.6rem] border p-5 text-left transition disabled:opacity-100 ${
                selected
                  ? "border-[#b9ff4a]/70 bg-[#b9ff4a]/[0.11] shadow-[0_15px_45px_rgba(185,255,74,0.08)]"
                  : disabled
                    ? "border-white/[0.06] bg-white/[0.015] grayscale"
                    : "border-white/10 bg-white/[0.025] hover:border-[#b9ff4a]/35"
              } disabled:cursor-not-allowed`}
              disabled={disabled}
              key={item.date}
              onClick={() => onChange(item.date)}
              type="button"
            >
              <span
                className={`block text-xs font-semibold capitalize ${
                  disabled ? "text-stone-600" : "text-[#b9ff4a]"
                }`}
              >
                {formatBookingWeekday(item.date)}
              </span>
              <strong
                className={`mt-2 block font-[family-name:var(--font-manrope)] text-lg ${
                  disabled ? "text-stone-500" : "text-white"
                }`}
              >
                {formatBookingDate(item.date)}
              </strong>
              <span className="mt-3 flex items-center justify-between gap-3 text-xs">
                <span className={disabled ? "text-stone-500" : "text-stone-300"}>
                  {item.availableSpots} {item.availableSpots === 1 ? "cupo disponible" : "cupos disponibles"}
                </span>
                <span className={disabled ? "font-semibold text-stone-500" : "text-[#b9ff4a]"}>
                  {statusLabels[item.status]}
                </span>
              </span>
              <span
                aria-label={`${item.availableSpots} de ${item.capacity} cupos disponibles`}
                aria-valuemax={item.capacity}
                aria-valuemin={0}
                aria-valuenow={item.availableSpots}
                className="mt-3 block"
                role="progressbar"
              >
                <span className="mb-1.5 flex items-center justify-between text-[0.58rem] font-semibold uppercase tracking-[0.14em]">
                  <span className="text-stone-500">
                    Espacios restantes
                  </span>
                  <span className={disabled ? "text-stone-500" : "text-[#b9ff4a]"}>
                    {item.availableSpots}/{item.capacity}
                  </span>
                </span>
                <span className="relative block h-2 overflow-hidden rounded-full bg-white/[0.07] ring-1 ring-inset ring-white/[0.06]">
                  <span
                    className={`booking-availability-bar block h-full rounded-full ${
                      disabled
                        ? "bg-stone-600"
                        : "bg-gradient-to-r from-[#7fbf27] via-[#b9ff4a] to-[#e2ffae] shadow-[0_0_16px_rgba(185,255,74,0.45)]"
                    }`}
                    style={{
                      "--availability-width": `${availabilityPercentage}%`,
                    } as React.CSSProperties}
                  />
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {errors.selectedDate ? (
        <p className="mt-4 text-sm font-medium text-red-400">{errors.selectedDate}</p>
      ) : null}
    </div>
  );
}
