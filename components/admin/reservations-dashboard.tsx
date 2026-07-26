"use client";

import { useMemo, useState } from "react";

import { formatBookingDate } from "@/components/booking/booking-date-selector";
import { bookingStatusLabels, rejectionReasons } from "@/lib/booking-status";
import { formatCrc } from "@/lib/tour-utils";
import { BUSINESS_TIMEZONE } from "@/lib/system-config";
import type { BookingMode, BookingRecord, BookingStatus } from "@/types/booking";

function whatsappDigits(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("506") ? digits : `506${digits}`;
}

function formatCreatedAt(value: string) {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return value;
  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: BUSINESS_TIMEZONE,
  }).format(timestamp);
}

function modeLabel(mode: BookingMode) {
  return mode === "gam_transport"
    ? "Grupal con transporte GAM"
    : mode === "private"
      ? "Privado"
      : "Llegada directa";
}

export function ReservationsDashboard({
  initialRecords,
}: Readonly<{ initialRecords: BookingRecord[] }>) {
  const [records, setRecords] = useState(initialRecords);
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [date, setDate] = useState("");
  const [mode, setMode] = useState("");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es");
    return records.filter(
      (record) =>
        (!status || record.status === status) &&
        (!date || record.selectedDate === date) &&
        (!mode || record.mode === mode) &&
        (!query ||
          [record.bookingCode, record.buyer.fullName, record.buyer.email]
            .join(" ")
            .toLocaleLowerCase("es")
            .includes(query)),
    );
  }, [date, mode, records, search, status]);

  const counts = (["pending_review", "approved", "rejected", "cancelled"] as const)
    .map((value) => ({
      label: bookingStatusLabels[value],
      value,
      count: records.filter((record) => record.status === value).length,
    }));

  const updateStatus = async (
    record: BookingRecord,
    nextStatus: "approved" | "rejected" | "cancelled",
  ) => {
    let reason = "";
    let adminNotes = "";
    if (nextStatus === "approved") {
      if (!window.confirm(`¿Aprobar la reserva ${record.bookingCode}?`)) return;
    } else {
      const suggested = window.prompt(
        `${nextStatus === "rejected" ? "Motivo del rechazo" : "Motivo de cancelación"} (obligatorio):\n${rejectionReasons.join("\n")}`,
      );
      if (!suggested?.trim()) {
        setError("Debes indicar un motivo para completar esta acción.");
        return;
      }
      reason = suggested.trim();
      adminNotes =
        window.prompt("Observación interna (opcional):")?.trim() ?? "";
      if (
        !window.confirm(
          `¿Confirmas ${nextStatus === "rejected" ? "el rechazo" : "la cancelación"} de ${record.bookingCode}?`,
        )
      )
        return;
    }
    setBusyId(record.id);
    setError("");
    const response = await fetch(`/api/admin/reservas/${record.id}`, {
      body: JSON.stringify({ adminNotes, reason, status: nextStatus }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
    const result = (await response.json()) as {
      error?: string;
      record?: BookingRecord;
    };
    setBusyId("");
    if (!response.ok || !result.record) {
      setError(result.error ?? "No fue posible actualizar la reserva.");
      return;
    }
    setRecords((current) =>
      current.map((item) => (item.id === result.record?.id ? result.record : item)),
    );
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.assign("/admin/login");
  };

  return (
    <main className="min-h-screen bg-[#070907] px-5 py-10 text-stone-200 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[92rem]">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b9ff4a]">
              Modo demostración local
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-manrope)] text-4xl font-extrabold tracking-tight text-white">
              Solicitudes de reserva
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              Contacto de la empresa: +506 6389-5974
            </p>
          </div>
          <button className="rounded-full border border-white/15 px-5 py-3 text-xs" onClick={logout} type="button">
            Cerrar sesión
          </button>
        </header>

        <section className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {counts.map((item) => (
            <button
              className={`rounded-[1.5rem] border p-5 text-left ${status === item.value ? "border-[#b9ff4a]/60 bg-[#b9ff4a]/[0.08]" : "border-white/10 bg-white/[0.025]"}`}
              key={item.value}
              onClick={() => setStatus(status === item.value ? "" : item.value)}
              type="button"
            >
              <span className="text-sm text-stone-400">{item.label}</span>
              <strong className="mt-2 block text-3xl text-white">{item.count}</strong>
            </button>
          ))}
        </section>

        <section className="mt-6 grid gap-3 rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-4 md:grid-cols-4">
          <input aria-label="Buscar por nombre o código" className="rounded-full border border-white/10 bg-black/25 px-4 py-3 text-sm" onChange={(event) => setSearch(event.target.value)} placeholder="Buscar nombre, código o correo" value={search} />
          <select aria-label="Filtrar por estado" className="rounded-full border border-white/10 bg-[#111411] px-4 py-3 text-sm" onChange={(event) => setStatus(event.target.value as BookingStatus | "")} value={status}>
            <option value="">Todos los estados</option>
            {counts.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <input aria-label="Filtrar por fecha del tour" className="rounded-full border border-white/10 bg-black/25 px-4 py-3 text-sm" onChange={(event) => setDate(event.target.value)} type="date" value={date} />
          <select aria-label="Filtrar por modalidad" className="rounded-full border border-white/10 bg-[#111411] px-4 py-3 text-sm" onChange={(event) => setMode(event.target.value)} value={mode}>
            <option value="">Todas las modalidades</option>
            <option value="gam_transport">Transporte GAM</option>
            <option value="private">Privado</option>
            <option value="direct">Llegada directa</option>
          </select>
        </section>
        {error ? <p className="mt-4 rounded-full bg-red-400/10 px-5 py-3 text-sm text-red-300">{error}</p> : null}

        <section className="mt-6 space-y-4">
          {filtered.length === 0 ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-10 text-center text-stone-500">No hay solicitudes que coincidan.</div>
          ) : filtered.map((record) => (
            <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 shadow-xl sm:p-7" key={record.id}>
              <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <strong className="font-[family-name:var(--font-manrope)] text-xl text-white">{record.bookingCode}</strong>
                    <span className="rounded-full border border-[#b9ff4a]/20 bg-[#b9ff4a]/[0.06] px-3 py-1 text-xs text-[#b9ff4a]">{bookingStatusLabels[record.status]}</span>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                    <p><span className="block text-xs text-stone-600">Comprador</span>{record.buyer.fullName}</p>
                    <p><span className="block text-xs text-stone-600">Fecha del tour</span>{formatBookingDate(record.selectedDate)}</p>
                    <p><span className="block text-xs text-stone-600">Modalidad</span>{modeLabel(record.mode)}</p>
                    <p><span className="block text-xs text-stone-600">Total</span>{formatCrc(record.total)} · {record.quantity} personas</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
                  <button className="rounded-full bg-[#b9ff4a] px-4 py-2 text-xs font-bold text-black" disabled={busyId === record.id || record.status !== "pending_review"} onClick={() => updateStatus(record, "approved")} type="button">Aprobar</button>
                  <button className="rounded-full border border-red-300/30 px-4 py-2 text-xs text-red-200" disabled={busyId === record.id || record.status !== "pending_review"} onClick={() => updateStatus(record, "rejected")} type="button">Rechazar</button>
                  <button className="rounded-full border border-white/15 px-4 py-2 text-xs" disabled={busyId === record.id || !["approved", "pending_review"].includes(record.status)} onClick={() => updateStatus(record, "cancelled")} type="button">Cancelar</button>
                </div>
              </div>
              <details className="mt-5 border-t border-white/10 pt-5">
                <summary className="cursor-pointer text-sm font-semibold text-[#b9ff4a]">Ver detalle completo</summary>
                <div className="mt-5 grid gap-5 text-sm lg:grid-cols-2">
                  <dl className="space-y-2">
                    <div><dt className="text-stone-600">Creada</dt><dd>{formatCreatedAt(record.createdAt)}</dd></div>
                    <div><dt className="text-stone-600">Tour</dt><dd>{record.tourName}</dd></div>
                    <div><dt className="text-stone-600">Correo</dt><dd>{record.buyer.email}</dd></div>
                    <div><dt className="text-stone-600">WhatsApp</dt><dd>{record.buyer.phone}</dd></div>
                    <div><dt className="text-stone-600">Punto de salida</dt><dd>{record.transportDetails.gam_transport.departurePoint || record.transportDetails.private.pickupZone || "No aplica"}</dd></div>
                    <div><dt className="text-stone-600">Titular SINPE</dt><dd>{record.sinpeAccountHolder} · {record.sinpeAccountNumber}</dd></div>
                    <div><dt className="text-stone-600">Motivo / notas</dt><dd>{record.rejectionReason || "—"} {record.adminNotes || ""}</dd></div>
                  </dl>
                  <div>
                    <h3 className="font-bold text-white">Participantes</h3>
                    <div className="mt-3 space-y-3">
                      {record.participants.map((participant) => (
                        <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4" key={participant.id}>
                          <strong>{participant.fullName}</strong>
                          <p className="mt-1 text-stone-400">Tel: {participant.phone}</p>
                          <p className="mt-1 text-stone-400">Condición física: {participant.fitness}</p>
                          <p className="mt-1 text-stone-400">Enfermedades, alergias o condiciones: {participant.hasMedicalCondition === "yes" ? participant.medicalDetails : "No reporta"}</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-stone-400">Restricciones alimentarias: {record.foodDetails.hasDietaryRestriction === "yes" ? record.foodDetails.dietaryDetails : "No reporta"}</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <a className="rounded-full border border-white/15 px-4 py-2 text-xs" href={`/api/admin/reservas/${record.id}/comprobante`} rel="noreferrer" target="_blank">Ver comprobante privado</a>
                  <a
                    className="rounded-full border border-[#b9ff4a]/30 px-4 py-2 text-xs text-[#b9ff4a]"
                    href={`https://wa.me/${whatsappDigits(record.buyer.phone)}?text=${encodeURIComponent(record.status === "approved" ? `Hola ${record.buyer.fullName}, tu reserva para Tour Ciudad Esmeralda el ${formatBookingDate(record.selectedDate)} ha sido aprobada. Tu código es ${record.bookingCode}. ¡Nos vemos en la aventura!` : record.status === "rejected" ? `Hola ${record.buyer.fullName}, no pudimos aprobar tu reserva para Tour Ciudad Esmeralda. Motivo: ${record.rejectionReason ?? "por revisar"}. Tu código es ${record.bookingCode}. Puedes contactarnos para corregir la información.` : `Hola ${record.buyer.fullName}, te contactamos sobre tu solicitud para Tour Ciudad Esmeralda el ${formatBookingDate(record.selectedDate)}. Tu código es ${record.bookingCode}.`)}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Contactar por WhatsApp
                  </a>
                </div>
              </details>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
