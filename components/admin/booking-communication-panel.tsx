"use client";

import { useState } from "react";

import { AdminIcon } from "@/components/admin/admin-icon";

export function BookingCommunicationPanel({
  email,
  message,
  phoneIsValid,
  receiptUrl,
  whatsappUrl,
}: Readonly<{
  email: string;
  message: string;
  phoneIsValid: boolean;
  receiptUrl?: string;
  whatsappUrl: string | null;
}>) {
  const [copied, setCopied] = useState(false);

  const copyMessage = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="admin-panel rounded-[1.5rem] p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-xl font-extrabold text-white">
        <AdminIcon className="size-5 text-[#b9ff4a]" name="mail" /> Comunicación
        con el cliente
      </h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div>
          <dt className="text-stone-500">Correo</dt>
          <dd className="break-all text-stone-200">{email}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Teléfono</dt>
          <dd className={phoneIsValid ? "text-emerald-200" : "text-red-200"}>
            {phoneIsValid ? "Formato válido para WhatsApp" : "Revisar número antes de contactar"}
          </dd>
        </div>
      </dl>
      <label className="mt-5 block text-sm font-medium text-stone-300">
        Mensaje sugerido
        <textarea
          className="admin-control mt-2 min-h-52 w-full resize-y rounded-xl p-4 text-sm leading-6"
          readOnly
          value={message}
        />
      </label>
      <div className="mt-4 grid gap-3">
        {whatsappUrl ? (
          <a
            className="admin-action inline-flex min-h-[52px] items-center justify-center rounded-xl bg-[#b9ff4a] px-5 text-xs font-bold uppercase tracking-[0.1em] text-black"
            href={whatsappUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Abrir WhatsApp
          </a>
        ) : null}
        <button
          className="min-h-[52px] rounded-xl border border-white/15 px-5 text-xs font-bold uppercase tracking-[0.1em] text-white"
          onClick={copyMessage}
          type="button"
        >
          {copied ? "Mensaje copiado" : "Copiar mensaje"}
        </button>
        {receiptUrl ? (
          <a
            className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-emerald-300/25 px-5 text-center text-xs font-bold uppercase tracking-[0.1em] text-emerald-100"
            href={receiptUrl}
            rel="noreferrer"
            target="_blank"
          >
            Abrir recibo de confirmación
          </a>
        ) : null}
      </div>
      <p className="mt-4 text-xs leading-5 text-stone-500">
        Ningún mensaje se envía automáticamente desde estos botones.
      </p>
    </section>
  );
}
