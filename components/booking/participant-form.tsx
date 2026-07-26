import {
  bookingChoiceClass,
  bookingErrorClass,
  bookingInputClass,
  bookingLabelClass,
} from "@/components/booking/booking-ui";
import type {
  BookingErrors,
  BookingParticipant,
  YesNo,
} from "@/types/booking";

type ParticipantFormProps = Readonly<{
  errors: BookingErrors;
  index: number;
  onChange: (participant: BookingParticipant) => void;
  participant: BookingParticipant;
  showEmail?: boolean;
  total: number;
}>;

export function ParticipantForm({
  errors,
  index,
  onChange,
  participant,
  showEmail = false,
  total,
}: ParticipantFormProps) {
  const prefix = `participants.${index}`;
  const update = <K extends keyof BookingParticipant>(
    field: K,
    value: BookingParticipant[K],
  ) => onChange({ ...participant, [field]: value });

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h4 className="font-[family-name:var(--font-manrope)] text-lg font-bold text-white">
          Participante {index + 1} de {total}
        </h4>
        <span className="rounded-full bg-[#b9ff4a]/10 px-3 py-1 text-xs font-semibold text-[#b9ff4a]">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label data-error={Boolean(errors[`${prefix}.fullName`])}>
          <span className={bookingLabelClass}>Nombre completo *</span>
          <input
            className={bookingInputClass}
            onChange={(event) => update("fullName", event.target.value)}
            value={participant.fullName}
          />
          {errors[`${prefix}.fullName`] ? (
            <span className={bookingErrorClass}>
              {errors[`${prefix}.fullName`]}
            </span>
          ) : null}
        </label>
        <label data-error={Boolean(errors[`${prefix}.phone`])}>
          <span className={bookingLabelClass}>Número de teléfono *</span>
          <input
            className={bookingInputClass}
            inputMode="tel"
            onChange={(event) => update("phone", event.target.value)}
            value={participant.phone}
          />
          {errors[`${prefix}.phone`] ? (
            <span className={bookingErrorClass}>
              {errors[`${prefix}.phone`]}
            </span>
          ) : null}
        </label>
        {showEmail ? (
          <label
            className="sm:col-span-2"
            data-error={Boolean(errors[`${prefix}.email`])}
          >
            <span className={bookingLabelClass}>Correo electrónico *</span>
            <input
              className={bookingInputClass}
              inputMode="email"
              onChange={(event) => update("email", event.target.value)}
              type="email"
              value={participant.email}
            />
            {errors[`${prefix}.email`] ? (
              <span className={bookingErrorClass}>
                {errors[`${prefix}.email`]}
              </span>
            ) : null}
          </label>
        ) : null}
      </div>

      <fieldset
        className="mt-5"
        data-error={Boolean(errors[`${prefix}.hasMedicalCondition`])}
      >
        <legend className={bookingLabelClass}>
          ¿Padece alguna enfermedad, condición médica o alergia? *
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {([
            ["no", "No"],
            ["yes", "Sí, especificar"],
          ] as const).map(([value, label]) => (
            <label className={`${bookingChoiceClass} cursor-pointer`} key={value}>
              <input
                checked={participant.hasMedicalCondition === value}
                className="mr-3 accent-[#b9ff4a]"
                name={`medical-${participant.id}`}
                onChange={() =>
                  onChange({
                    ...participant,
                    hasMedicalCondition: value as YesNo,
                    medicalDetails:
                      value === "no" ? "" : participant.medicalDetails,
                  })
                }
                type="radio"
              />
              <span className="text-sm font-medium text-stone-300">{label}</span>
            </label>
          ))}
        </div>
        {errors[`${prefix}.hasMedicalCondition`] ? (
          <p className={bookingErrorClass}>
            {errors[`${prefix}.hasMedicalCondition`]}
          </p>
        ) : null}
      </fieldset>

      {participant.hasMedicalCondition === "yes" ? (
        <label
          className="mt-5 block"
          data-error={Boolean(errors[`${prefix}.medicalDetails`])}
        >
          <span className={bookingLabelClass}>
            Especifica la condición o alergia *
          </span>
          <textarea
            className={`${bookingInputClass} min-h-28 py-3`}
            onChange={(event) => update("medicalDetails", event.target.value)}
            value={participant.medicalDetails}
          />
          {errors[`${prefix}.medicalDetails`] ? (
            <span className={bookingErrorClass}>
              {errors[`${prefix}.medicalDetails`]}
            </span>
          ) : null}
        </label>
      ) : null}

      <label
        className="mt-5 block"
        data-error={Boolean(errors[`${prefix}.fitness`])}
      >
        <span className={bookingLabelClass}>Condición física actual *</span>
        <textarea
          className={`${bookingInputClass} min-h-24 py-3`}
          onChange={(event) => update("fitness", event.target.value)}
          placeholder="Describe brevemente tu condición física actual"
          value={participant.fitness}
        />
        {errors[`${prefix}.fitness`] ? (
          <span className={bookingErrorClass}>
            {errors[`${prefix}.fitness`]}
          </span>
        ) : null}
      </label>
    </section>
  );
}
