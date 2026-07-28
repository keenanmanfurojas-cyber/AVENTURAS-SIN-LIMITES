import Link from "next/link";

import { formatBookingDate } from "@/lib/booking-date";
import { BUSINESS_TIMEZONE } from "@/lib/system-config";
import { formatCrc } from "@/lib/tour-utils";
import type { BookingConfig, BookingRecord } from "@/types/booking";

function formatHoldExpiration(value?: string | null) {
  if (!value) return "No disponible";
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return "No disponible";

  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: BUSINESS_TIMEZONE,
  }).format(timestamp);
}

export function BookingConfirmation({
  config,
  record,
}: Readonly<{
  config: BookingConfig;
  record: BookingRecord;
}>) {
  const mode = config.modes.find((option) => option.id === record.mode);
  const message = `Hola, quiero consultar el estado de mi solicitud para Ciudad Esmeralda el ${formatBookingDate(record.selectedDate)}. Mi código es ${record.bookingCode}.`;
  const whatsappUrl = `${config.whatsappBaseUrl}?text=${encodeURIComponent(message)}`;
  const holdExpiration = formatHoldExpiration(record.pendingHoldUntil);

  return (
    <section
      aria-labelledby="booking-confirmation-title"
      className="mx-auto max-w-4xl rounded-[2.25rem] border border-[#b9ff4a]/20 bg-[radial-gradient(circle_at_top,rgba(185,255,74,0.1),transparent_38%),rgba(255,255,255,0.03)] p-6 text-center shadow-[0_30px_100px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-12"
    >
      <div
        aria-hidden="true"
        className="mx-auto grid size-16 place-items-center rounded-full bg-[#b9ff4a] text-2xl font-bold text-black shadow-[0_0_45px_rgba(185,255,74,0.25)]"
      >
        ✓
      </div>
      <p className="mt-7 inline-flex min-h-8 items-center rounded-full border border-[#b9ff4a]/30 bg-[#b9ff4a]/10 px-4 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#cbff7a]">
        Pendiente de revisión
      </p>
      <h2
        className="mt-4 font-[family-name:var(--font-manrope)] text-3xl font-extrabold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl"
        id="booking-confirmation-title"
      >
        Solicitud recibida correctamente
      </h2>
      <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-stone-400">
        Estamos revisando tu comprobante y la información suministrada.
      </p>
      <dl className="mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-2">
        {[
          ["Código de reserva", record.bookingCode],
          ["Fecha del tour", formatBookingDate(record.selectedDate)],
          ["Modalidad", mode?.label ?? record.mode],
          ["Cantidad de participantes", String(record.quantity)],
          ["Total", formatCrc(record.total)],
          ["Estado del comprobante", "Recibido · pendiente de validación"],
        ].map(([label, value]) => (
          <div
            className="rounded-2xl border border-white/10 bg-black/20 p-4"
            key={label}
          >
            <dt className="text-xs font-medium text-stone-400">{label}</dt>
            <dd className="mt-1 break-words font-semibold text-stone-100">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mx-auto mt-6 max-w-2xl rounded-[1.75rem] border border-[#b9ff4a]/30 bg-[#b9ff4a]/[0.075] p-5 text-left sm:p-6">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#cbff7a]">
          Retención temporal activa
        </p>
        <h3 className="mt-3 font-[family-name:var(--font-manrope)] text-lg font-bold leading-7 text-white sm:text-xl">
          Tu fecha quedó retenida temporalmente mientras verificamos tu
          comprobante de pago.
        </h3>
        <p className="mt-4 text-sm leading-6 text-stone-300">
          <span className="font-semibold text-white">Vence:</span>{" "}
          <time dateTime={record.pendingHoldUntil ?? undefined}>
            {holdExpiration}
          </time>{" "}
          <span className="whitespace-nowrap">(hora de Costa Rica)</span>
        </p>
      </div>

      <div
        className="mx-auto mt-4 max-w-2xl rounded-2xl border border-amber-300/30 bg-amber-300/[0.075] p-4 text-left"
        role="note"
      >
        <p className="text-sm font-semibold leading-6 text-amber-100">
          Esta solicitud todavía no constituye una reserva confirmada.
        </p>
      </div>

      <div className="mx-auto mt-4 max-w-2xl rounded-[1.75rem] border border-white/10 bg-black/20 p-5 text-left sm:p-6">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-stone-300">
          Próximos pasos
        </p>
        <p className="mt-3 text-sm leading-7 text-stone-300 sm:text-base">
          Una vez validemos tu pago, recibirás la confirmación definitiva.
        </p>
      </div>

      <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row sm:gap-3">
        <a
          className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-[#b9ff4a] px-7 py-3 text-center text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-[#cbff7a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9ff4a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080a08] sm:min-h-12 sm:w-auto sm:px-6"
          href={whatsappUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          Consultar por WhatsApp
        </a>
        <Link
          className="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border border-white/20 px-7 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-stone-200 transition hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#080a08] sm:min-h-12 sm:w-auto sm:px-6"
          href="/"
        >
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}
