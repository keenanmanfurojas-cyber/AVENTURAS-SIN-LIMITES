import {
  bookingChoiceClass,
  bookingErrorClass,
  bookingInputClass,
  bookingLabelClass,
} from "@/components/booking/booking-ui";
import { ciudadEsmeraldaDeparturePoints } from "@/lib/booking-config";
import { formatCrc } from "@/lib/tour-utils";
import type {
  BookingErrors,
  DirectArrivalDetails as DirectDetails,
  GamTransportDetails as GamDetails,
  PrivateTourDetails as PrivateDetails,
  YesNo,
} from "@/types/booking";

type GamTransportDetailsProps = Readonly<{
  details: GamDetails;
  errors: BookingErrors;
  onChange: (details: GamDetails) => void;
}>;

function YesNoChoice({
  error,
  label,
  name,
  onChange,
  value,
}: Readonly<{
  error?: string;
  label: string;
  name: string;
  onChange: (value: YesNo) => void;
  value: YesNo;
}>) {
  return (
    <fieldset data-error={Boolean(error)}>
      <legend className={bookingLabelClass}>{label} *</legend>
      <div className="grid grid-cols-2 gap-3">
        {([
          ["yes", "Sí"],
          ["no", "No"],
        ] as const).map(([option, optionLabel]) => (
          <label className={`${bookingChoiceClass} cursor-pointer`} key={option}>
            <input
              checked={value === option}
              className="mr-3 accent-[#b9ff4a]"
              name={name}
              onChange={() => onChange(option)}
              type="radio"
            />
            <span className="text-sm font-medium text-stone-300">
              {optionLabel}
            </span>
          </label>
        ))}
      </div>
      {error ? <p className={bookingErrorClass}>{error}</p> : null}
    </fieldset>
  );
}

export function TransportDetails({
  details,
  errors,
  onChange,
}: GamTransportDetailsProps) {
  return (
    <div>
      <h3 className="font-[family-name:var(--font-manrope)] text-2xl font-extrabold text-white">
        Transporte desde la GAM
      </h3>
      <fieldset
        className="mt-7"
        data-error={Boolean(errors.departurePoint)}
      >
        <legend className={bookingLabelClass}>Punto de salida *</legend>
        <div className="grid gap-3">
          {ciudadEsmeraldaDeparturePoints.map((point) => (
            <label className={`${bookingChoiceClass} cursor-pointer`} key={point}>
              <input
                checked={details.departurePoint === point}
                className="mr-3 accent-[#b9ff4a]"
                name="departure-point"
                onChange={() =>
                  onChange({ ...details, departurePoint: point })
                }
                type="radio"
              />
              <span className="text-sm font-medium leading-6 text-stone-300">
                {point}
              </span>
            </label>
          ))}
        </div>
        {errors.departurePoint ? (
          <p className={bookingErrorClass}>{errors.departurePoint}</p>
        ) : null}
      </fieldset>
      <div className="mt-7 grid gap-6">
        <p className="rounded-2xl border border-[#b9ff4a]/15 bg-[#b9ff4a]/[0.035] p-4 text-sm leading-6 text-stone-300">
          Esta modalidad incluye alimentación para cada participante.
        </p>
        <YesNoChoice
          error={errors.hasDietaryRestriction}
          label="¿Tiene alguna restricción alimentaria?"
          name="dietary-restriction"
          onChange={(hasDietaryRestriction) =>
            onChange({
              ...details,
              hasDietaryRestriction,
              dietaryDetails:
                hasDietaryRestriction === "no" ? "" : details.dietaryDetails,
            })
          }
          value={details.hasDietaryRestriction}
        />
      </div>
      {details.hasDietaryRestriction === "yes" ? (
        <label
          className="mt-5 block"
          data-error={Boolean(errors.dietaryDetails)}
        >
          <span className={bookingLabelClass}>
            Especifica la restricción alimentaria *
          </span>
          <textarea
            className={`${bookingInputClass} min-h-24 py-3`}
            onChange={(event) =>
              onChange({ ...details, dietaryDetails: event.target.value })
            }
            value={details.dietaryDetails}
          />
          {errors.dietaryDetails ? (
            <span className={bookingErrorClass}>{errors.dietaryDetails}</span>
          ) : null}
        </label>
      ) : null}
    </div>
  );
}

export function PrivateTourDetails({
  details,
  errors,
  mealExtra,
  onChange,
  participantCount,
  pricePerPerson,
}: Readonly<{
  details: PrivateDetails;
  errors: BookingErrors;
  mealExtra: number;
  onChange: (details: PrivateDetails) => void;
  participantCount: number;
  pricePerPerson: number;
}>) {
  const includesMeal = details.requiresMeal === "yes";
  const totalPerPerson = pricePerPerson + (includesMeal ? mealExtra : 0);

  return (
    <div>
      <h3 className="font-[family-name:var(--font-manrope)] text-2xl font-extrabold text-white">
        Tour privado
      </h3>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <p className={bookingChoiceClass}>
          <span className="block text-xs text-stone-500">Personas</span>
          <strong className="mt-1 block text-lg text-white">
            {participantCount}
          </strong>
        </p>
        <p className={bookingChoiceClass}>
          <span className="block text-xs text-stone-500">Por persona</span>
          <strong className="mt-1 block text-lg text-white">
            {formatCrc(pricePerPerson)}
          </strong>
        </p>
        <p className={bookingChoiceClass}>
          <span className="block text-xs text-stone-500">Total</span>
          <strong className="mt-1 block text-lg text-[#b9ff4a]">
            {formatCrc(totalPerPerson * participantCount)}
          </strong>
        </p>
      </div>
      <div className="mt-6">
        <YesNoChoice
          error={errors.privateRequiresMeal}
          label={`¿Deseas agregar alimentación por ${formatCrc(mealExtra)} por persona?`}
          name="private-requires-meal"
          onChange={(requiresMeal) =>
            onChange({ ...details, requiresMeal })
          }
          value={details.requiresMeal}
        />
        <p className="mt-3 text-xs leading-6 text-stone-500">
          Es un extra opcional. Al elegir Sí, se suma automáticamente al total
          de cada participante.
        </p>
      </div>
      <p className="mt-5 rounded-2xl border border-[#b9ff4a]/15 bg-[#b9ff4a]/[0.035] p-4 text-sm leading-6 text-stone-400">
        El punto exacto de encuentro y las indicaciones de llegada serán
        confirmados antes del tour.
      </p>
    </div>
  );
}

export function DirectArrivalDetails({
  details,
  errors,
  onChange,
}: Readonly<{
  details: DirectDetails;
  errors: BookingErrors;
  onChange: (details: DirectDetails) => void;
}>) {
  return (
    <div>
      <h3 className="font-[family-name:var(--font-manrope)] text-2xl font-extrabold text-white">
        Llegada directa
      </h3>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <label data-error={Boolean(errors.arrivalTime)}>
          <span className={bookingLabelClass}>
            Hora aproximada de llegada *
          </span>
          <input
            className={bookingInputClass}
            onChange={(event) =>
              onChange({ ...details, arrivalTime: event.target.value })
            }
            type="time"
            value={details.arrivalTime}
          />
          {errors.arrivalTime ? (
            <span className={bookingErrorClass}>{errors.arrivalTime}</span>
          ) : null}
        </label>
        <label>
          <span className={bookingLabelClass}>
            Medio de transporte (opcional)
          </span>
          <input
            className={bookingInputClass}
            onChange={(event) =>
              onChange({ ...details, transportMethod: event.target.value })
            }
            placeholder="Vehículo propio, taxi…"
            value={details.transportMethod}
          />
        </label>
      </div>
      <p className="mt-5 rounded-2xl border border-[#b9ff4a]/15 bg-[#b9ff4a]/[0.035] p-4 text-sm leading-6 text-stone-400">
        El punto exacto de encuentro será confirmado antes del tour.
      </p>
    </div>
  );
}
