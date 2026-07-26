import { bookingStepLabels } from "@/lib/booking-utils";

type BookingProgressProps = Readonly<{
  currentStep: number;
  steps?: ReadonlyArray<{ index: number; label: string }>;
}>;

export function BookingProgress({
  currentStep,
  steps = bookingStepLabels.map((label, index) => ({ index, label })),
}: BookingProgressProps) {
  const currentPosition = Math.max(
    0,
    steps.findIndex((item) => item.index === currentStep),
  );
  const progress = ((currentPosition + 1) / steps.length) * 100;

  return (
    <div aria-label={`Paso ${currentPosition + 1} de ${steps.length}`}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="font-[family-name:var(--font-poppins)] text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[#b9ff4a]">
          Paso {currentPosition + 1} de {steps.length}
        </p>
        <p className="font-[family-name:var(--font-manrope)] text-sm font-bold text-stone-300">
          {steps[currentPosition]?.label}
        </p>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-[#b9ff4a] shadow-[0_0_18px_rgba(185,255,74,0.28)] transition-[width] duration-500 ease-refined"
          style={{ width: `${progress}%` }}
        />
      </div>
      <ol
        className="mt-4 hidden gap-2 lg:grid"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      >
        {steps.map((item, index) => (
          <li
            className={`truncate text-center font-[family-name:var(--font-poppins)] text-[0.5rem] font-semibold uppercase tracking-[0.08em] ${
              index <= currentPosition ? "text-[#b9ff4a]" : "text-stone-700"
            }`}
            key={item.index}
          >
            {item.label}
          </li>
        ))}
      </ol>
    </div>
  );
}
