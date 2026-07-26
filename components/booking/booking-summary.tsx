import {
  getBookingPricePerPerson,
  getBookingTotal,
  getModeConfig,
} from "@/lib/booking-utils";
import { formatCrc } from "@/lib/tour-utils";
import type { BookingConfig, BookingDraft } from "@/types/booking";
import { formatBookingDate } from "@/components/booking/booking-date-selector";

type BookingSummaryProps = Readonly<{
  completedSteps: number;
  config: BookingConfig;
  draft: BookingDraft;
  totalSteps?: number;
  variant?: "desktop" | "mobile";
}>;

function SummaryContent({
  completedSteps,
  config,
  draft,
  totalSteps = 8,
}: BookingSummaryProps) {
  const mode = getModeConfig(config, draft.mode);
  const total = getBookingTotal(config, draft);
  const pricePerPerson = getBookingPricePerPerson(config, draft);
  const departurePoint =
    draft.mode === "gam_transport"
      ? draft.modeDetails.gam_transport.departurePoint
      : "";
  const privateMealExtra =
    draft.mode === "private" &&
    draft.modeDetails.private.requiresMeal === "yes";

  return (
    <div>
      <p className="font-[family-name:var(--font-poppins)] text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-[#b9ff4a]">
        Resumen de reserva
      </p>
      <h3 className="mt-3 font-[family-name:var(--font-manrope)] text-2xl font-extrabold tracking-[-0.03em] text-white">
        {config.tourName}
      </h3>
      <dl className="mt-6 space-y-4 text-sm">
        <div>
          <dt className="text-stone-600">Modalidad</dt>
          <dd className="mt-1 font-medium text-stone-300">
            {mode?.label ?? "Pendiente"}
          </dd>
        </div>
        <div>
          <dt className="text-stone-600">Fecha del tour</dt>
          <dd className="mt-1 font-medium capitalize text-stone-300">
            {formatBookingDate(draft.selectedDate)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-stone-600">Personas</dt>
          <dd className="font-semibold text-stone-300">
            {draft.participantCount}
          </dd>
        </div>
        {privateMealExtra ? (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-stone-600">Alimentación extra</dt>
            <dd className="font-semibold text-stone-300">
              {formatCrc(config.privateMealExtraCrc)} p. p.
            </dd>
          </div>
        ) : null}
        {departurePoint ? (
          <div>
            <dt className="text-stone-600">Punto de salida</dt>
            <dd className="mt-1 font-medium leading-6 text-stone-300">
              {departurePoint}
            </dd>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-4">
          <dt className="text-stone-600">Precio por persona</dt>
          <dd className="font-semibold text-stone-300">
            {pricePerPerson === null
              ? "Pendiente"
              : formatCrc(pricePerPerson)}
          </dd>
        </div>
      </dl>
      <div className="mt-6 border-t border-white/10 pt-5">
        <div className="flex items-end justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
            Total
          </p>
          <p className="font-[family-name:var(--font-manrope)] text-3xl font-extrabold text-[#b9ff4a]">
            {total === null ? "Pendiente" : formatCrc(total)}
          </p>
        </div>
        <div className="mt-5">
          <div className="mb-2 flex justify-between text-xs text-stone-500">
            <span>Completitud</span>
            <span>{completedSteps}/{totalSteps} pasos</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-[#b9ff4a] transition-[width] duration-500"
              style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BookingSummary(props: BookingSummaryProps) {
  const { variant = "desktop" } = props;

  if (variant === "mobile") {
    return (
      <details className="group mb-5 rounded-[1.75rem] border border-[#b9ff4a]/15 bg-white/[0.035] p-5 backdrop-blur-xl lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between font-[family-name:var(--font-manrope)] font-bold text-white [&::-webkit-details-marker]:hidden">
          Ver resumen
          <span className="text-[#b9ff4a] transition-transform group-open:rotate-45">
            +
          </span>
        </summary>
        <div className="mt-5 border-t border-white/10 pt-5">
          <SummaryContent {...props} />
        </div>
      </details>
    );
  }

  return (
    <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
      <div className="rounded-[2rem] border border-[#b9ff4a]/15 bg-[linear-gradient(145deg,rgba(185,255,74,0.055),rgba(255,255,255,0.025))] p-7 shadow-[0_26px_85px_rgba(0,0,0,0.3)] backdrop-blur-xl">
        <SummaryContent {...props} />
      </div>
    </aside>
  );
}
