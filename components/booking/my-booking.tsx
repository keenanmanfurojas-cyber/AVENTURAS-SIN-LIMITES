"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { formatBookingDate } from "@/lib/booking-date";
import { formatCrc } from "@/lib/tour-utils";
import { siteConfig } from "@/lib/site-config";
import type { PublicBookingRecord } from "@/types/booking";

const statusContent = {
  approved: {
    badge: "Aprobada",
    instructions:
      "Tu reserva está confirmada. Conserva el código y llega según las indicaciones coordinadas por el equipo.",
  },
  pending_review: {
    badge: "Pendiente de revisión",
    instructions:
      "Recibimos tu solicitud y comprobante. El equipo debe validar el pago antes de confirmar la reserva.",
  },
  rejected: {
    badge: "Requiere atención",
    instructions:
      "No fue posible confirmar la solicitud. Contáctanos para revisar el pago o corregir la información.",
  },
} as const;

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Costa_Rica",
  }).format(new Date(value));
}

export function MyBooking() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("codigo")?.toUpperCase() ?? "";
  const token = searchParams.get("acceso") ?? "";
  const [code, setCode] = useState(initialCode);
  const [email, setEmail] = useState("");
  const [booking, setBooking] = useState<PublicBookingRecord | null>(null);
  const [bookingAccessToken, setBookingAccessToken] = useState(token);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [passError, setPassError] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  const lookup = async (accessToken = "") => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/mi-reserva", {
        body: JSON.stringify({
          code: code || initialCode,
          email: accessToken ? undefined : email,
          token: accessToken || undefined,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json()) as {
        accessToken?: string;
        booking?: PublicBookingRecord;
        error?: string;
      };
      if (!response.ok || !payload.booking) {
        setBooking(null);
        setError(payload.error ?? "No fue posible consultar la reserva.");
        return;
      }
      setCode(payload.booking.bookingCode);
      setBookingAccessToken(payload.accessToken ?? accessToken);
      setBooking(payload.booking);
    } catch {
      setError("No fue posible conectar con el sistema.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode && token) void lookup(token);
    // El enlace firmado solo se consume al cargar o recargar esta URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode, token]);

  const copyCode = async () => {
    if (!booking) return;
    await navigator.clipboard.writeText(booking.bookingCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const downloadAdventurePass = async () => {
    if (!booking || !bookingAccessToken) {
      setPassError("Vuelve a consultar la reserva para descargar el pase.");
      return;
    }
    setPassLoading(true);
    setPassError("");
    try {
      const response = await fetch("/api/mi-reserva/adventure-pass", {
        body: JSON.stringify({
          code: booking.bookingCode,
          token: bookingAccessToken,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setPassError(payload?.error ?? "No fue posible descargar el pase.");
        return;
      }
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = `adventure-pass-${booking.bookingCode}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch {
      setPassError("No fue posible descargar el pase.");
    } finally {
      setPassLoading(false);
    }
  };

  if (booking) {
    const status = statusContent[booking.status];
    const message = `Hola, quiero consultar mi reserva ${booking.bookingCode}.`;
    const whatsappUrl = `${siteConfig.contact.whatsapp.baseUrl}?text=${encodeURIComponent(message)}`;
    return (
      <section className="rounded-[2rem] border border-[#b9ff4a]/20 bg-white/[0.035] p-6 shadow-2xl sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b9ff4a]">
          Mi reserva
        </p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white sm:text-5xl">
              {booking.bookingCode}
            </h1>
            <p className="mt-3 text-sm text-stone-400">
              Guarda este código. Lo necesitarás junto con tu correo para volver
              a consultar desde otro dispositivo.
            </p>
          </div>
          <button
            className="min-h-12 rounded-full border border-white/15 px-5 text-sm font-semibold text-white"
            onClick={copyCode}
            type="button"
          >
            {copied ? "Código copiado" : "Copiar código"}
          </button>
        </div>
        <p className="mt-6 inline-flex rounded-full bg-[#b9ff4a]/10 px-4 py-2 text-sm font-bold text-[#cbff7a]">
          {status.badge}
        </p>
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            ["Fecha", formatBookingDate(booking.selectedDate)],
            ["Tour", booking.tourName],
            ["Modalidad", booking.mode],
            ["Participantes", String(booking.quantity)],
            ["Monto", formatCrc(booking.total)],
            ["Creada", formatTimestamp(booking.createdAt)],
            [
              "Comprobante",
              booking.paymentStatus === "verified"
                ? "Verificado"
                : booking.paymentStatus === "rejected"
                  ? "Requiere corrección"
                  : "Recibido · en revisión",
            ],
          ].map(([label, value]) => (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4" key={label}>
              <dt className="text-xs text-stone-500">{label}</dt>
              <dd className="mt-1 font-semibold text-stone-100">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 rounded-2xl border border-[#b9ff4a]/20 bg-[#b9ff4a]/[0.055] p-5">
          <h2 className="font-bold text-white">¿Qué sigue?</h2>
          <p className="mt-2 text-sm leading-7 text-stone-300">
            {status.instructions}
          </p>
        </div>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          {booking.status === "approved" ? (
            <button
              className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#b9ff4a] px-7 font-bold text-black disabled:opacity-60"
              disabled={passLoading}
              onClick={downloadAdventurePass}
              type="button"
            >
              {passLoading
                ? "Generando Adventure Pass…"
                : "Descargar Adventure Pass"}
            </button>
          ) : null}
          <a className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#b9ff4a] px-7 font-bold text-black" href={whatsappUrl} rel="noopener noreferrer" target="_blank">
            Contactar por WhatsApp
          </a>
          <Link className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/15 px-7 font-semibold text-white" href="/">
            Volver al inicio
          </Link>
        </div>
        {passError ? (
          <p className="mt-4 text-sm text-red-300" role="alert">
            {passError}
          </p>
        ) : null}
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 shadow-2xl sm:p-10">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b9ff4a]">
        Consultar reserva
      </p>
      <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-5xl">
        Encuentra tu reserva
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-7 text-stone-400">
        Por seguridad necesitas el código y el mismo correo utilizado al comprar.
      </p>
      <form
        className="mt-7 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          void lookup();
        }}
      >
        <label className="block">
          <span className="text-sm font-medium text-stone-300">Código de reserva</span>
          <input className="mt-2 min-h-[52px] w-full rounded-xl border border-white/15 bg-black/25 px-4 uppercase text-white" maxLength={12} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="ASL-CE-XXXXX" required value={code} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-300">Correo de compra</span>
          <input className="mt-2 min-h-[52px] w-full rounded-xl border border-white/15 bg-black/25 px-4 text-white" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
        </label>
        {error ? <p className="text-sm text-red-300" role="alert">{error}</p> : null}
        <button className="min-h-[52px] w-full rounded-full bg-[#b9ff4a] px-7 font-bold text-black disabled:opacity-60" disabled={loading} type="submit">
          {loading ? "Consultando…" : "Consultar mi reserva"}
        </button>
      </form>
      <Link className="mt-5 inline-flex text-sm font-semibold text-stone-300 underline" href="/">
        Volver al inicio
      </Link>
    </section>
  );
}
