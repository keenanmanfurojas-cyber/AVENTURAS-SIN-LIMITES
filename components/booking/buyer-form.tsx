import {
  bookingErrorClass,
  bookingInputClass,
  bookingLabelClass,
} from "@/components/booking/booking-ui";
import type { BookingBuyer, BookingErrors } from "@/types/booking";
import {
  normalizePhoneToE164,
  phoneCountryOptions,
} from "@/lib/contact-validation";

type BuyerFormProps = Readonly<{
  buyer: BookingBuyer;
  errors: BookingErrors;
  onChange: (buyer: BookingBuyer) => void;
}>;

export function BuyerForm({ buyer, errors, onChange }: BuyerFormProps) {
  const update = <K extends keyof BookingBuyer>(
    field: K,
    value: BookingBuyer[K],
  ) => onChange({ ...buyer, [field]: value });
  const normalizedPhone = normalizePhoneToE164(
    buyer.phone,
    buyer.countryCode,
  );

  return (
    <div>
      <h3 className="font-[family-name:var(--font-manrope)] text-2xl font-extrabold tracking-[-0.03em] text-white sm:text-3xl">
        Comprador responsable
      </h3>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-400">
        Será el contacto principal, responsable del pago y receptor de la
        confirmación.
      </p>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <label
          className="sm:col-span-2"
          data-error={Boolean(errors["buyer.fullName"])}
        >
          <span className={bookingLabelClass}>Nombre completo *</span>
          <input
            className={bookingInputClass}
            onChange={(event) => update("fullName", event.target.value)}
            value={buyer.fullName}
          />
          {errors["buyer.fullName"] ? (
            <span className={bookingErrorClass}>
              {errors["buyer.fullName"]}
            </span>
          ) : null}
        </label>
        <label data-error={Boolean(errors["buyer.email"])}>
          <span className={bookingLabelClass}>Correo electrónico *</span>
          <input
            className={bookingInputClass}
            inputMode="email"
            onChange={(event) => update("email", event.target.value)}
            type="email"
            value={buyer.email}
          />
          {errors["buyer.email"] ? (
            <span className={bookingErrorClass}>{errors["buyer.email"]}</span>
          ) : null}
        </label>
        <label data-error={Boolean(errors["buyer.phone"])}>
          <span className={bookingLabelClass}>País *</span>
          <select
            className={bookingInputClass}
            onChange={(event) => update("countryCode", event.target.value)}
            value={buyer.countryCode}
          >
            {phoneCountryOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label data-error={Boolean(errors["buyer.phone"])}>
          <span className={bookingLabelClass}>Teléfono / WhatsApp *</span>
          <input
            className={bookingInputClass}
            inputMode="tel"
            onChange={(event) => update("phone", event.target.value)}
            type="tel"
            value={buyer.phone}
          />
          {errors["buyer.phone"] ? (
            <span className={bookingErrorClass}>{errors["buyer.phone"]}</span>
          ) : null}
        </label>
      </div>
      <p className="mt-3 text-xs leading-5 text-stone-500">
        Número final:{" "}
        <strong className={normalizedPhone ? "text-stone-300" : "text-amber-300"}>
          {normalizedPhone ?? "Completa un número válido"}
        </strong>
      </p>
      <label className="mt-6 flex min-h-[52px] cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition focus-within:border-[#b9ff4a]/60 focus-within:ring-2 focus-within:ring-[#b9ff4a]/20">
        <input
          checked={buyer.isParticipant}
          className="mt-1 size-4 accent-[#b9ff4a]"
          onChange={(event) => update("isParticipant", event.target.checked)}
          type="checkbox"
        />
        <span className="text-sm font-medium leading-6 text-stone-300">
          El comprador también participa en el tour
        </span>
      </label>
    </div>
  );
}
