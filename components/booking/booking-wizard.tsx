"use client";

import { useEffect, useMemo, useState } from "react";

import { BookingConfirmation } from "@/components/booking/booking-confirmation";
import { BookingDateSelector } from "@/components/booking/booking-date-selector";
import { BookingModeSelector } from "@/components/booking/booking-mode-selector";
import { BookingProgress } from "@/components/booking/booking-progress";
import { BookingSummary } from "@/components/booking/booking-summary";
import { BuyerForm } from "@/components/booking/buyer-form";
import {
  DirectArrivalDetails,
  PrivateTourDetails,
  TransportDetails,
} from "@/components/booking/mode-details";
import { ParticipantForm } from "@/components/booking/participant-form";
import { SinpePayment } from "@/components/booking/sinpe-payment";
import {
  createEmptyBookingDraft,
  createParticipant,
  bookingStepLabels,
  getBookingPricePerPerson,
  getBookingTotal,
  getModeConfig,
  validateBookingStep,
} from "@/lib/booking-utils";
import { formatCrc } from "@/lib/tour-utils";
import type {
  BookingBuyer,
  BookingConfig,
  BookingDraft,
  BookingErrors,
  BookingMode,
  BookingParticipant,
  BookingRecord,
} from "@/types/booking";

const receiptTypes = ["image/png", "image/jpeg", "image/webp"];
const receiptOptimizationThreshold = 3 * 1024 * 1024;
const maximumReceiptBytes = 5 * 1024 * 1024;

async function optimizeReceipt(file: File) {
  if (file.size <= receiptOptimizationThreshold) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const maxDimension = 1800;
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return file;
    }
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.82),
    );
    if (!blob) return file;
    const baseName = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${baseName}-optimizado.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}

function scrollToFirstError() {
  window.requestAnimationFrame(() => {
    const target = document.querySelector<HTMLElement>(
      "#booking-wizard [data-error='true']",
    );
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
    target
      ?.querySelector<HTMLElement>("input, select, textarea, button")
      ?.focus({ preventScroll: true });
  });
}

function restoreDraft(value: string): BookingDraft | null {
  try {
    const parsed = JSON.parse(value) as Partial<BookingDraft>;
    const empty = createEmptyBookingDraft();
    if (!parsed.participantCount || parsed.participantCount < 1) return null;
    return {
      ...empty,
      ...parsed,
      buyer: { ...empty.buyer, ...parsed.buyer },
      modeDetails: {
        direct: {
          ...empty.modeDetails.direct,
          ...parsed.modeDetails?.direct,
        },
        gam_transport: {
          ...empty.modeDetails.gam_transport,
          ...parsed.modeDetails?.gam_transport,
        },
        private: {
          ...empty.modeDetails.private,
          ...parsed.modeDetails?.private,
        },
      },
      participants: Array.from(
        { length: parsed.participantCount },
        (_, index) => ({
          ...createParticipant(index),
          ...parsed.participants?.[index],
          id: parsed.participants?.[index]?.id ?? `participant-${index + 1}`,
        }),
      ),
    };
  } catch {
    return null;
  }
}

export function BookingWizard({
  config,
}: Readonly<{ config: BookingConfig }>) {
  const [draft, setDraft] = useState<BookingDraft>(createEmptyBookingDraft);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<BookingErrors>({});
  const [receipt, setReceipt] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [record, setRecord] = useState<BookingRecord | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const total = getBookingTotal(config, draft);
  const currentMode = getModeConfig(config, draft.mode);
  const pricePerPerson = getBookingPricePerPerson(config, draft);
  const activeSteps = useMemo(
    () =>
      draft.participantCount === 1
        ? [
            { index: 0, label: bookingStepLabels[0] },
            { index: 1, label: bookingStepLabels[1] },
            { index: 2, label: bookingStepLabels[2] },
            { index: 3, label: "Participante" },
            { index: 5, label: bookingStepLabels[5] },
            { index: 6, label: bookingStepLabels[6] },
            { index: 7, label: bookingStepLabels[7] },
          ]
        : bookingStepLabels.map((label, index) => ({ index, label })),
    [draft.participantCount],
  );

  useEffect(() => {
    const saved = window.localStorage.getItem(config.storageKey);
    const restored = saved ? restoreDraft(saved) : null;
    const validMode =
      restored &&
      config.modes.some((option) => option.id === restored.mode);
    setDraft(() => {
      if (restored) {
        const nextDraft: BookingDraft = {
            ...restored,
            mode: validMode ? restored.mode : "",
            modeDetails: validMode
              ? restored.modeDetails
              : createEmptyBookingDraft().modeDetails,
          };
        if (nextDraft.participantCount === 1) {
          const participant = nextDraft.participants[0];
          const soloParticipant = {
            ...participant,
            email: participant.email || nextDraft.buyer.email,
            fullName: participant.fullName || nextDraft.buyer.fullName,
            phone: participant.phone || nextDraft.buyer.phone,
          };
          nextDraft.participants = [soloParticipant];
          nextDraft.buyer = {
            email: soloParticipant.email,
            fullName: soloParticipant.fullName,
            isParticipant: true,
            phone: soloParticipant.phone,
          };
        }
        return nextDraft;
      }
      return createEmptyBookingDraft();
    });
    setHydrated(true);
  }, [config]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(config.storageKey, JSON.stringify(draft));
  }, [config.storageKey, draft, hydrated]);

  useEffect(() => {
    if (!receipt) {
      setPreviewUrl("");
      return;
    }
    const nextUrl = URL.createObjectURL(receipt);
    setPreviewUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [receipt]);

  const completedSteps = useMemo(() => {
    let completed = 0;
    for (const { index } of activeSteps) {
      if (
        Object.keys(
          validateBookingStep(index, draft, config, Boolean(receipt)),
        ).length > 0
      ) {
        break;
      }
      completed += 1;
    }
    return completed;
  }, [activeSteps, config, draft, receipt]);

  const updateDraft = (next: BookingDraft) => {
    setDraft(next);
    setErrors({});
  };

  const changeMode = (mode: BookingMode) => {
    const emptyDetails = createEmptyBookingDraft().modeDetails;
    updateDraft({
      ...draft,
      mode,
      modeDetails: emptyDetails,
      participantCount: 1,
      participants: [createParticipant(0)],
    });
  };

  const changeParticipantCount = (amount: number) => {
    const count = Math.max(1, draft.participantCount + amount);
    const participants = Array.from({ length: count }, (_, index) =>
      draft.participants[index]
        ? draft.participants[index]
        : createParticipant(index),
    );
    if (count === 1 && participants[0]) {
      const participant = {
        ...participants[0],
        email: participants[0].email || draft.buyer.email,
        fullName: participants[0].fullName || draft.buyer.fullName,
        phone: participants[0].phone || draft.buyer.phone,
      };
      updateDraft({
        ...draft,
        buyer: {
          email: participant.email,
          fullName: participant.fullName,
          isParticipant: true,
          phone: participant.phone,
        },
        participantCount: count,
        participants: [participant],
      });
      return;
    }
    updateDraft({ ...draft, participantCount: count, participants });
  };

  const changeBuyer = (buyer: BookingBuyer) => {
    const participants = [...draft.participants];
    if (buyer.isParticipant && participants[0]) {
      participants[0] = {
        ...participants[0],
        fullName: buyer.fullName,
        phone: buyer.phone,
      };
    }
    updateDraft({ ...draft, buyer, participants });
  };

  const changeParticipant = (
    index: number,
    participant: BookingParticipant,
  ) => {
    const participants = [...draft.participants];
    participants[index] = participant;
    updateDraft({
      ...draft,
      buyer:
        draft.participantCount === 1 && index === 0
          ? {
              email: participant.email,
              fullName: participant.fullName,
              isParticipant: true,
              phone: participant.phone,
            }
          : draft.buyer,
      participants,
    });
  };

  const changeReceipt = async (file: File | null) => {
    if (!file) {
      setReceipt(null);
      setErrors({});
      return;
    }
    if (!receiptTypes.includes(file.type)) {
      setReceipt(null);
      setErrors({ receipt: "Usa un archivo PNG, JPG, JPEG o WEBP." });
      scrollToFirstError();
      return;
    }
    const optimized = await optimizeReceipt(file);
    if (optimized.size > maximumReceiptBytes) {
      setReceipt(null);
      setErrors({
        receipt: "El comprobante debe pesar máximo 5 MB.",
      });
      scrollToFirstError();
      return;
    }
    setReceipt(optimized);
    setErrors({});
  };

  const next = () => {
    const nextErrors = validateBookingStep(
      step,
      draft,
      config,
      Boolean(receipt),
    );
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      scrollToFirstError();
      return;
    }
    setErrors({});
    const currentPosition = activeSteps.findIndex(({ index }) => index === step);
    const nextStep = activeSteps[currentPosition + 1]?.index ?? 7;
    setStep(nextStep);
    document
      .querySelector("#booking-wizard")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submit = async () => {
    for (const { index } of activeSteps) {
      const stepErrors = validateBookingStep(
        index,
        draft,
        config,
        Boolean(receipt),
      );
      if (Object.keys(stepErrors).length > 0) {
        setStep(index);
        setErrors(stepErrors);
        scrollToFirstError();
        return;
      }
    }

    if (!receipt || !draft.mode || total === null || !currentMode) return;

    setSubmitting(true);
    try {
      const body = new FormData();
      body.set("draft", JSON.stringify(draft));
      body.set("paymentProof", receipt);
      const response = await fetch("/api/reservas", { body, method: "POST" });
      const payload = (await response.json()) as {
        error?: string;
        reservation?: BookingRecord;
      };
      if (!response.ok || !payload.reservation) {
        setErrors({ submit: payload.error ?? "No pudimos enviar la solicitud." });
        return;
      }
      window.localStorage.removeItem(config.storageKey);
      setRecord(payload.reservation);
      document
        .querySelector("#booking-wizard")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      setErrors({
        submit: "No fue posible conectar con el sistema. Intenta de nuevo.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const stepContent = (() => {
    if (step === 0) {
      return (
        <BookingModeSelector
          config={config}
          errors={errors}
          mode={draft.mode}
          onChange={changeMode}
        />
      );
    }
    if (step === 1) {
      return (
        <div>
          <h3 className="font-[family-name:var(--font-manrope)] text-2xl font-extrabold tracking-[-0.03em] text-white sm:text-3xl">
            ¿Cuántas personas participan?
          </h3>
          <p className="mt-3 text-sm leading-7 text-stone-400">
            Crearemos un formulario individual para cada participante.
          </p>
          <div
            className="mt-8 inline-flex items-center gap-5 rounded-full border border-[#b9ff4a]/20 bg-[#b9ff4a]/[0.045] p-2 sm:gap-6"
            data-error={Boolean(errors.participantCount)}
          >
            <button
              aria-label="Restar una persona"
              className="grid size-[52px] place-items-center rounded-full border border-white/10 bg-black/25 text-2xl text-white outline-none transition hover:border-[#b9ff4a]/40 focus-visible:border-[#b9ff4a]/70 focus-visible:ring-2 focus-visible:ring-[#b9ff4a]/25 sm:size-12"
              onClick={() => changeParticipantCount(-1)}
              type="button"
            >
              −
            </button>
            <strong className="min-w-10 text-center font-[family-name:var(--font-manrope)] text-3xl text-[#b9ff4a]">
              {draft.participantCount}
            </strong>
            <button
              aria-label="Agregar una persona"
              className="grid size-[52px] place-items-center rounded-full border border-white/10 bg-black/25 text-2xl text-white outline-none transition hover:border-[#b9ff4a]/40 focus-visible:border-[#b9ff4a]/70 focus-visible:ring-2 focus-visible:ring-[#b9ff4a]/25 sm:size-12"
              onClick={() => changeParticipantCount(1)}
              type="button"
            >
              +
            </button>
          </div>
          {errors.participantCount ? (
            <p className="mt-4 text-sm font-medium text-red-400">
              {errors.participantCount}
            </p>
          ) : null}
          {draft.mode === "private" ? (
            <p className="mt-6 max-w-xl rounded-2xl border border-[#b9ff4a]/15 bg-[#b9ff4a]/[0.035] p-4 text-sm leading-6 text-stone-400">
              Una persona paga {formatCrc(35000)}. Desde 2 participantes, el
              precio es {formatCrc(28000)} por persona.
            </p>
          ) : null}
        </div>
      );
    }
    if (step === 2) {
      return (
        <BookingDateSelector
          dates={config.availableDates}
          errors={errors}
          mode={draft.mode}
          onChange={(selectedDate) => updateDraft({ ...draft, selectedDate })}
          selectedDate={draft.selectedDate}
          tourSlug={config.tourId}
        />
      );
    }
    if (step === 3) {
      if (draft.participantCount === 1) {
        return (
          <div>
            <h3 className="font-[family-name:var(--font-manrope)] text-2xl font-extrabold tracking-[-0.03em] text-white sm:text-3xl">
              Datos del participante
            </h3>
            <p className="mt-3 text-sm leading-7 text-stone-400">
              Esta información también se utilizará como contacto principal de
              la reserva.
            </p>
            <div className="mt-7">
              <ParticipantForm
                errors={errors}
                index={0}
                onChange={(participant) => changeParticipant(0, participant)}
                participant={draft.participants[0]}
                showEmail
                total={1}
              />
            </div>
          </div>
        );
      }
      return (
        <BuyerForm
          buyer={draft.buyer}
          errors={errors}
          onChange={changeBuyer}
        />
      );
    }
    if (step === 4 && draft.participantCount > 1) {
      return (
        <div>
          <h3 className="font-[family-name:var(--font-manrope)] text-2xl font-extrabold tracking-[-0.03em] text-white sm:text-3xl">
            Datos de participantes
          </h3>
          <p className="mt-3 text-sm leading-7 text-stone-400">
            Completa la información de cada persona para preparar la experiencia
            con seguridad.
          </p>
          <div className="mt-7 space-y-4">
            {draft.participants.map((participant, index) => (
              <ParticipantForm
                errors={errors}
                index={index}
                key={participant.id}
                onChange={(nextParticipant) =>
                  changeParticipant(index, nextParticipant)
                }
                participant={participant}
                total={draft.participantCount}
              />
            ))}
          </div>
        </div>
      );
    }
    if (step === 5 && draft.mode === "gam_transport") {
      return (
        <TransportDetails
          details={draft.modeDetails.gam_transport}
          errors={errors}
          onChange={(gamTransport) =>
            updateDraft({
              ...draft,
              modeDetails: {
                ...draft.modeDetails,
                gam_transport: gamTransport,
              },
            })
          }
        />
      );
    }
    if (
      step === 5 &&
      draft.mode === "private" &&
      currentMode &&
      pricePerPerson !== null
    ) {
      return (
        <PrivateTourDetails
          details={draft.modeDetails.private}
          errors={errors}
          mealExtra={config.privateMealExtraCrc}
          onChange={(privateDetails) =>
            updateDraft({
              ...draft,
              modeDetails: {
                ...draft.modeDetails,
                private: privateDetails,
              },
            })
          }
          participantCount={draft.participantCount}
          pricePerPerson={pricePerPerson}
        />
      );
    }
    if (step === 5 && draft.mode === "direct") {
      return (
        <DirectArrivalDetails
          details={draft.modeDetails.direct}
          errors={errors}
          onChange={(direct) =>
            updateDraft({
              ...draft,
              modeDetails: { ...draft.modeDetails, direct },
            })
          }
        />
      );
    }
    if (step === 6 && total !== null) {
      return (
        <SinpePayment
          errors={errors}
          onReceiptChange={changeReceipt}
          previewUrl={previewUrl}
          receipt={receipt}
          sinpeAccountHolder={config.sinpeAccountHolder}
          sinpeNumber={config.sinpeNumber}
          total={total}
        />
      );
    }
    return (
      <div>
        <p className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[#b9ff4a]">
          Revisión final
        </p>
        <h3 className="mt-3 font-[family-name:var(--font-manrope)] text-2xl font-extrabold tracking-[-0.03em] text-white sm:text-3xl">
          Confirma tu solicitud
        </h3>
        <p className="mt-3 text-sm leading-7 text-stone-400">
          El comprobante será revisado manualmente. Esta solicitud no representa
          una validación automática del pago.
        </p>
        <label
          className={`mt-7 flex min-h-[52px] cursor-pointer items-start gap-4 rounded-[1.5rem] border p-5 transition focus-within:ring-2 focus-within:ring-[#b9ff4a]/20 ${
            errors.termsAccepted
              ? "border-red-400/60 bg-red-400/[0.04]"
              : "border-[#b9ff4a]/20 bg-[#b9ff4a]/[0.035]"
          }`}
          data-error={Boolean(errors.termsAccepted)}
        >
          <input
            checked={draft.termsAccepted}
            className="mt-1 size-5 shrink-0 accent-[#b9ff4a]"
            onChange={(event) =>
              updateDraft({ ...draft, termsAccepted: event.target.checked })
            }
            type="checkbox"
          />
          <span className="text-sm font-medium leading-7 text-stone-300">
            Confirmo que la información suministrada es correcta y acepto los
            términos de participación.
          </span>
        </label>
        {errors.termsAccepted ? (
          <p className="mt-3 text-sm font-medium text-red-400">
            {errors.termsAccepted}
          </p>
        ) : null}
      </div>
    );
  })();

  return (
    <section
      className="scroll-mt-20 border-y border-[#b9ff4a]/10 bg-[radial-gradient(circle_at_15%_5%,rgba(185,255,74,0.055),transparent_30%),#080a08] px-6 py-20 sm:px-8 lg:px-12 lg:py-28"
      id="reservar-ciudad-esmeralda"
    >
      <div className="mx-auto max-w-[90rem]" id="booking-wizard">
        {record ? (
          <BookingConfirmation config={config} record={record} />
        ) : (
          <>
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-[#b9ff4a]">
                Reserva Ciudad Esmeralda
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-manrope)] text-4xl font-extrabold tracking-[-0.04em] text-white sm:text-6xl">
                Tu aventura, paso a paso
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-stone-400 sm:text-base">
                Completa una etapa a la vez. Tu progreso se guarda temporalmente
                en este dispositivo.
              </p>
            </div>

            <BookingSummary
              completedSteps={completedSteps}
              config={config}
              draft={draft}
              totalSteps={activeSteps.length}
              variant="mobile"
            />
            <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
              <div className="overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/[0.03] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:p-8">
                <BookingProgress currentStep={step} steps={activeSteps} />
                <div className="motion-fade-up mt-9" key={step}>
                  {stepContent}
                </div>
                <div className="mt-9 flex flex-col-reverse gap-4 border-t border-white/10 pt-6 sm:flex-row sm:justify-between sm:gap-3">
                  <button
                    className="min-h-[52px] w-full rounded-full border border-white/20 px-7 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-200 outline-none transition hover:border-white/40 focus-visible:border-white/50 focus-visible:ring-2 focus-visible:ring-white/40 disabled:cursor-not-allowed disabled:opacity-30 sm:min-h-13 sm:w-auto sm:px-6"
                    disabled={step === 0}
                    onClick={() => {
                      setErrors({});
                      const currentPosition = activeSteps.findIndex(
                        ({ index }) => index === step,
                      );
                      setStep(activeSteps[currentPosition - 1]?.index ?? 0);
                    }}
                    type="button"
                  >
                    Anterior
                  </button>
                  <button
                    className="min-h-[52px] w-full rounded-full bg-[#b9ff4a] px-8 py-3 text-xs font-bold uppercase tracking-[0.14em] text-black shadow-[0_14px_40px_rgba(185,255,74,0.14)] outline-none transition hover:-translate-y-0.5 hover:bg-[#cbff7a] focus-visible:ring-2 focus-visible:ring-[#b9ff4a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080a08] disabled:cursor-wait disabled:opacity-70 sm:min-h-13 sm:w-auto sm:px-7"
                    disabled={submitting}
                    onClick={step === 7 ? submit : next}
                    type="button"
                  >
                    {step === 7
                      ? submitting
                        ? "Enviando…"
                        : "Enviar solicitud"
                      : "Continuar"}
                  </button>
                </div>
                {errors.submit ? (
                  <p className="mt-4 text-sm font-medium text-red-400">
                    {errors.submit}
                  </p>
                ) : null}
              </div>
              <BookingSummary
                completedSteps={completedSteps}
                config={config}
                draft={draft}
                totalSteps={activeSteps.length}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
