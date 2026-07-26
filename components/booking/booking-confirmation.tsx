import Link from "next/link";

import { formatCrc } from "@/lib/tour-utils";
import { formatBookingDate } from "@/components/booking/booking-date-selector";
import type { BookingConfig, BookingRecord } from "@/types/booking";

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

  return (
    <section className="mx-auto max-w-4xl rounded-[2.25rem] border border-[#b9ff4a]/20 bg-[radial-gradient(circle_at_top,rgba(185,255,74,0.1),transparent_38%),rgba(255,255,255,0.03)] p-7 text-center shadow-[0_30px_100px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-12">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#b9ff4a] text-2xl text-black shadow-[0_0_45px_rgba(185,255,74,0.25)]">
        ✓
      </div>
      <p className="mt-7 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-[#b9ff4a]">
        Pendiente de revisión
      </p>
      <h2 className="mt-3 font-[family-name:var(--font-manrope)] text-4xl font-extrabold tracking-[-0.04em] text-white sm:text-6xl">
        Solicitud recibida
      </h2>
      <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-stone-400">
        Estamos revisando tu comprobante y la información suministrada.
      </p>
      <dl className="mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-2">
        {[
          ["Código", record.bookingCode],
          ["Fecha del tour", formatBookingDate(record.selectedDate)],
          ["Tour", record.tourName],
          ["Modalidad", mode?.label ?? record.mode],
          ["Cantidad", String(record.quantity)],
          ["Total", formatCrc(record.total)],
          ["Estado", "Pendiente de revisión"],
          ["Titular SINPE", record.sinpeAccountHolder],
        ].map(([label, value]) => (
          <div
            className="rounded-2xl border border-white/10 bg-black/20 p-4"
            key={label}
          >
            <dt className="text-xs text-stone-600">{label}</dt>
            <dd className="mt-1 font-semibold text-stone-200">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
        <a
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#b9ff4a] px-6 text-xs font-bold uppercase tracking-[0.14em] text-black"
          href={whatsappUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          Consultar por WhatsApp
        </a>
        <Link
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-6 text-xs font-semibold uppercase tracking-[0.14em] text-stone-300"
          href="/"
        >
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}
