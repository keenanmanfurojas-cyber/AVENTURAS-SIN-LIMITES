import { formatCrc } from "@/lib/tour-utils";
import type {
  BookingConfig,
  BookingErrors,
  BookingMode,
} from "@/types/booking";

type BookingModeSelectorProps = Readonly<{
  config: BookingConfig;
  errors: BookingErrors;
  mode: BookingMode | "";
  onChange: (mode: BookingMode) => void;
}>;

export function BookingModeSelector({
  config,
  errors,
  mode,
  onChange,
}: BookingModeSelectorProps) {
  return (
    <fieldset data-error={Boolean(errors.mode)}>
      <legend className="font-[family-name:var(--font-manrope)] text-2xl font-extrabold tracking-[-0.03em] text-white sm:text-3xl">
        ¿Cómo deseas vivir la experiencia?
      </legend>
      <div className="mt-7 grid gap-4">
        {config.modes.map((option) => {
          const selected = option.id === mode;
          return (
            <label
              className={`cursor-pointer rounded-[1.5rem] border p-5 transition sm:p-6 ${
                selected
                  ? "border-[#b9ff4a]/60 bg-[#b9ff4a]/[0.07] shadow-[0_18px_55px_rgba(0,0,0,0.2)]"
                  : "border-white/10 bg-white/[0.025] hover:border-[#b9ff4a]/25"
              }`}
              key={option.id}
            >
              <input
                checked={selected}
                className="sr-only"
                name="booking-mode"
                onChange={() => onChange(option.id)}
                type="radio"
                value={option.id}
              />
              <span className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className={`mt-1 grid size-5 shrink-0 place-items-center rounded-full border ${
                    selected
                      ? "border-[#b9ff4a] bg-[#b9ff4a]"
                      : "border-stone-600"
                  }`}
                >
                  {selected ? (
                    <span className="size-1.5 rounded-full bg-black" />
                  ) : null}
                </span>
                <span className="min-w-0">
                  <span className="block font-[family-name:var(--font-manrope)] text-lg font-bold text-stone-100">
                    {option.label}
                  </span>
                  <span className="mt-2 block font-[family-name:var(--font-poppins)] text-sm font-medium leading-6 text-stone-400">
                    {option.description}
                  </span>
                  <span className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-black/25 px-3 py-1.5 font-[family-name:var(--font-poppins)] text-xs font-semibold text-[#b9ff4a]">
                      {option.singleParticipantPriceCrc
                        ? `${formatCrc(option.pricePerPersonCrc)} p. p. desde 2`
                        : `${formatCrc(option.pricePerPersonCrc)} por persona`}
                    </span>
                    {option.singleParticipantPriceCrc ? (
                      <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-stone-400">
                        Individual:{" "}
                        {formatCrc(option.singleParticipantPriceCrc)}
                      </span>
                    ) : null}
                    {option.minimumParticipants > 1 ? (
                      <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-stone-400">
                        Mínimo {option.minimumParticipants} personas
                      </span>
                    ) : null}
                  </span>
                </span>
              </span>
            </label>
          );
        })}
      </div>
      {errors.mode ? (
        <p className="mt-3 text-sm font-medium text-red-400">{errors.mode}</p>
      ) : null}
    </fieldset>
  );
}
