import Image from "next/image";
import type { ChangeEvent } from "react";

import { bookingErrorClass } from "@/components/booking/booking-ui";
import { formatCrc } from "@/lib/tour-utils";
import type { BookingErrors } from "@/types/booking";

type SinpePaymentProps = Readonly<{
  errors: BookingErrors;
  onReceiptChange: (file: File | null) => void;
  previewUrl: string;
  receipt: File | null;
  sinpeAccountHolder: string;
  sinpeNumber: string;
  total: number;
}>;

export function SinpePayment({
  errors,
  onReceiptChange,
  previewUrl,
  receipt,
  sinpeAccountHolder,
  sinpeNumber,
  total,
}: SinpePaymentProps) {
  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    onReceiptChange(event.target.files?.[0] ?? null);
  };

  return (
    <div>
      <h3 className="font-[family-name:var(--font-manrope)] text-2xl font-extrabold tracking-[-0.03em] text-white sm:text-3xl">
        Pago por SINPE
      </h3>
      <p className="mt-3 text-sm leading-7 text-stone-400">
        Realiza un único pago por la reserva completa y adjunta el comprobante.
        Su validación será manual.
      </p>
      <div className="mt-7 rounded-[2rem] border border-[#b9ff4a]/15 bg-[linear-gradient(145deg,rgba(185,255,74,0.07),rgba(255,255,255,0.025))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <p className="text-xs text-stone-500">Número SINPE</p>
          <p className="mt-2 font-[family-name:var(--font-manrope)] text-2xl font-extrabold text-white">
            {sinpeNumber}
          </p>
          <button
            className="mt-4 rounded-full border border-[#b9ff4a]/30 px-4 py-2 text-xs font-semibold text-[#b9ff4a]"
            onClick={() => copy(sinpeNumber)}
            type="button"
          >
            Copiar número
          </button>
          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="text-xs text-stone-500">Titular de la cuenta</p>
            <p className="mt-2 font-[family-name:var(--font-manrope)] text-lg font-bold text-white">
              {sinpeAccountHolder}
            </p>
          </div>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-black/15 p-5">
          <p className="text-xs text-stone-500">Monto exacto</p>
          <p className="mt-2 font-[family-name:var(--font-manrope)] text-3xl font-extrabold text-[#b9ff4a]">
            {formatCrc(total)}
          </p>
        </div>
        </div>
      <div className="mt-5 border-t border-white/10 pt-5">
        <p className="text-xs text-stone-500">Descripción del SINPE</p>
        <strong className="mt-2 block font-[family-name:var(--font-manrope)] text-xl text-white">
          Reserva Ciudad Esmeralda
        </strong>
        <p className="mt-3 text-sm leading-6 text-stone-500">
          El código único de la reserva se asignará al enviar la solicitud.
        </p>
      </div>
      </div>

      <label
        className={`mt-5 block cursor-pointer rounded-[1.5rem] border border-dashed p-6 text-center transition ${
          errors.receipt
            ? "border-red-400/60 bg-red-400/[0.04]"
            : "border-[#b9ff4a]/25 bg-white/[0.02] hover:border-[#b9ff4a]/50"
        }`}
        data-error={Boolean(errors.receipt)}
      >
        <input
          accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={handleFile}
          required
          type="file"
        />
        <span className="block font-[family-name:var(--font-manrope)] font-bold text-white">
          Subir comprobante
        </span>
        <span className="mt-2 block text-xs text-stone-500">
          PNG, JPG, JPEG o WEBP · optimización automática
        </span>
      </label>
      {errors.receipt ? (
        <p className={bookingErrorClass}>{errors.receipt}</p>
      ) : null}

      {receipt && previewUrl ? (
        <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
          <div className="relative h-64 overflow-hidden rounded-xl">
            <Image
              alt="Previsualización del comprobante SINPE"
              className="object-contain"
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              src={previewUrl}
              unoptimized
            />
          </div>
          <div className="mt-3 flex items-center justify-between gap-4 text-xs text-stone-500">
            <span className="truncate">{receipt.name}</span>
            <button
              className="shrink-0 text-stone-300 underline underline-offset-4"
              onClick={() => onReceiptChange(null)}
              type="button"
            >
              Quitar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
