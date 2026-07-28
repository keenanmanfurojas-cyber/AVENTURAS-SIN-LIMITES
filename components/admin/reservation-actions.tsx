"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { BookingStatus } from "@/types/booking";
import { AdminIcon } from "@/components/admin/admin-icon";

type Action = "approve" | "note" | "reject";

const actionCopy = {
  approve: {
    description:
      "La reserva pasará a confirmada. Supabase volverá a comprobar la disponibilidad antes de completar la operación.",
    label: "Aprobar reserva",
    title: "Confirmar aprobación",
  },
  note: {
    description:
      "La nota quedará registrada en el historial administrativo de esta reserva.",
    label: "Agregar nota",
    title: "Nueva nota administrativa",
  },
  reject: {
    description:
      "La reserva pasará a rechazada y la retención temporal se liberará.",
    label: "Rechazar reserva",
    title: "Confirmar rechazo",
  },
} as const;

export function ReservationActions({
  bookingCode,
  bookingId,
  status,
}: Readonly<{
  bookingCode: string;
  bookingId: string;
  status: BookingStatus;
}>) {
  const router = useRouter();
  const [action, setAction] = useState<Action | null>(null);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const close = () => {
    if (loading) return;
    setAction(null);
    setReason("");
    setNote("");
    setError("");
  };

  const submit = async () => {
    if (!action) return;
    if (action === "reject" && reason.trim().length < 3) {
      setError("Indica el motivo del rechazo.");
      return;
    }
    if (action === "note" && !note.trim()) {
      setError("Escribe la nota administrativa.");
      return;
    }

    setLoading(true);
    setError("");
    const body =
      action === "approve"
        ? { action, adminNotes: note }
        : action === "reject"
          ? { action, adminNotes: note, reason }
          : { action, note };
    try {
      const response = await fetch(`/api/admin/reservas/${bookingId}`, {
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "No fue posible completar la operación.");
        return;
      }
      setAction(null);
      setReason("");
      setNote("");
      router.refresh();
    } catch {
      setError("No fue posible conectar con el sistema.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section
        aria-labelledby="reservation-actions-title"
        className="admin-panel rounded-[1.5rem] p-5 sm:p-6"
      >
        <h2
          className="flex items-center gap-2 text-xl font-extrabold text-white"
          id="reservation-actions-title"
        >
          <AdminIcon className="size-5 text-[#b9ff4a]" name="shield" /> Acciones administrativas
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-400">
          Cada operación queda asociada a tu cuenta administrativa.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {status === "pending_review" ? (
            <>
              <button
                className="admin-action min-h-[52px] rounded-xl bg-[#b9ff4a] px-6 text-xs font-extrabold uppercase tracking-[0.1em] text-[#071006] outline-none transition hover:bg-[#d0ff87] focus-visible:ring-2 focus-visible:ring-[#b9ff4a]"
                onClick={() => setAction("approve")}
                type="button"
              >
                Aprobar reserva
              </button>
              <button
                className="min-h-[52px] rounded-xl border border-red-300/25 bg-red-300/[0.04] px-6 text-xs font-bold uppercase tracking-[0.1em] text-red-200 outline-none transition hover:bg-red-300/[0.09] focus-visible:ring-2 focus-visible:ring-red-300/30"
                onClick={() => setAction("reject")}
                type="button"
              >
                Rechazar reserva
              </button>
            </>
          ) : null}
          <button
            className="min-h-[52px] rounded-xl border border-white/15 px-6 text-xs font-bold uppercase tracking-[0.1em] text-stone-200 outline-none transition hover:border-white/30 hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-white/30 sm:col-span-2"
            onClick={() => setAction("note")}
            type="button"
          >
            Agregar nota
          </button>
        </div>
      </section>

      {action ? (
        <div
          aria-labelledby="admin-action-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/85 p-4 backdrop-blur-md"
          role="dialog"
        >
          <div className="admin-panel relative w-full max-w-lg overflow-hidden rounded-[1.75rem] bg-[#0c110d] p-6 shadow-2xl sm:p-7">
            <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[#b9ff4a]/70 to-transparent" />
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b9ff4a]">
              {bookingCode}
            </p>
            <h2
              className="mt-3 text-2xl font-extrabold tracking-[-0.03em] text-white"
              id="admin-action-title"
            >
              {actionCopy[action].title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-stone-400">
              {actionCopy[action].description}
            </p>

            {action === "reject" ? (
              <label className="mt-5 block text-sm font-medium text-stone-300">
                Motivo del rechazo *
                <textarea
                  autoFocus
                  className="admin-control mt-2 min-h-28 w-full resize-y rounded-xl p-4 outline-none focus:border-red-300/50 focus:ring-2 focus:ring-red-300/15"
                  onChange={(event) => setReason(event.target.value)}
                  value={reason}
                />
              </label>
            ) : null}
            <label className="mt-5 block text-sm font-medium text-stone-300">
              {action === "note"
                ? "Nota administrativa *"
                : "Nota administrativa (opcional)"}
              <textarea
                autoFocus={action === "note"}
                className="admin-control mt-2 min-h-28 w-full resize-y rounded-xl p-4 outline-none"
                onChange={(event) => setNote(event.target.value)}
                value={note}
              />
            </label>
            {error ? (
              <p className="mt-4 text-sm text-red-300" role="alert">
                {error}
              </p>
            ) : null}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                className="min-h-[52px] rounded-xl border border-white/15 px-6 text-xs font-semibold text-stone-200 outline-none hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-white/30"
                disabled={loading}
                onClick={close}
                type="button"
              >
                Volver
              </button>
              <button
                autoFocus={action === "approve"}
                className={`min-h-[52px] rounded-xl px-6 text-xs font-bold text-black outline-none focus-visible:ring-2 ${
                  action === "reject"
                    ? "bg-red-200 focus-visible:ring-red-300"
                    : "bg-[#b9ff4a] focus-visible:ring-[#b9ff4a]"
                }`}
                disabled={loading}
                onClick={submit}
                type="button"
              >
                {loading ? "Guardando…" : actionCopy[action].label}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
