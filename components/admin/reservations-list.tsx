"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { formatBookingDate } from "@/lib/booking-date";
import {
  adminModeLabel,
  adminStatusLabels,
  formatAdminTimestamp,
  getAdminDisplayStatus,
  type AdminDisplayStatus,
} from "@/lib/admin-booking-ui";
import { formatCrc } from "@/lib/tour-utils";
import type { BookingRecord } from "@/types/booking";
import { AdminIcon } from "@/components/admin/admin-icon";

const filterClass =
  "admin-control min-h-[52px] w-full rounded-xl px-4 text-sm outline-none";

export function ReservationsList({
  initialDate = "",
  initialRecords,
}: Readonly<{ initialDate?: string; initialRecords: BookingRecord[] }>) {
  const [status, setStatus] = useState<AdminDisplayStatus | "">("");
  const [date, setDate] = useState(initialDate);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("es");
    return initialRecords.filter((record) => {
      const displayStatus = getAdminDisplayStatus(record);
      return (
        (!status || displayStatus === status) &&
        (!date || record.selectedDate === date) &&
        (!query ||
          [record.bookingCode, record.buyer.fullName]
            .join(" ")
            .toLocaleLowerCase("es")
            .includes(query))
      );
    });
  }, [date, initialRecords, search, status]);

  return (
    <>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9ff4a]">
          Gestión de solicitudes
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
          Centro de reservas
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-400">
          Ordenadas desde la solicitud más reciente.
        </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm text-stone-400">
          <AdminIcon className="size-5 text-[#b9ff4a]" name="document" />
          <span><strong className="text-white">{initialRecords.length}</strong> totales</span>
        </div>
      </div>

      <section
        aria-label="Filtros de reservas"
        className="admin-panel mt-8 grid gap-4 rounded-[1.5rem] p-4 sm:p-5 md:grid-cols-3"
      >
        <label className="text-xs font-bold text-stone-400">
          Buscar
          <span className="relative mt-2 block">
            <AdminIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-500" name="search" />
            <input
            className={`${filterClass} pl-11`}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ej. ASL-CE o nombre"
            type="search"
            value={search}
            />
          </span>
        </label>
        <label className="text-xs font-bold text-stone-400">
          Estado
          <span className="relative mt-2 block">
            <select
            className={`${filterClass} pr-10`}
            onChange={(event) =>
              setStatus(event.target.value as AdminDisplayStatus | "")
            }
            value={status}
          >
            <option value="">Todos los estados</option>
            {(
              [
                "pending_review",
                "approved",
                "rejected",
                "cancelled",
                "expired",
              ] as const
            ).map((value) => (
              <option key={value} value={value}>
                {adminStatusLabels[value]}
              </option>
            ))}
            </select>
            <AdminIcon className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 rotate-90 text-stone-500" name="arrow" />
          </span>
        </label>
        <label className="text-xs font-bold text-stone-400">
          Fecha del tour
          <input
            className={`${filterClass} mt-2`}
            onChange={(event) => setDate(event.target.value)}
            type="date"
            value={date}
          />
        </label>
      </section>

      <p className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-stone-500" aria-live="polite">
        <AdminIcon className="size-4" name="filter" /> {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
      </p>

      <section className="mt-4 space-y-4" aria-label="Listado de reservas">
        {filtered.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.025] p-10 text-center">
            <h2 className="font-[family-name:var(--font-manrope)] text-xl font-bold text-white">
              No hay reservas para mostrar
            </h2>
            <p className="mt-2 text-sm text-stone-400">
              Ajusta los filtros para ampliar la búsqueda.
            </p>
          </div>
        ) : (
          filtered.map((record) => {
            const displayStatus = getAdminDisplayStatus(record);
            return (
              <article
                className="admin-panel group relative overflow-hidden rounded-[1.5rem] p-5 transition duration-300 hover:border-white/[0.17] sm:p-6"
                key={record.id}
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-xl border border-white/10 bg-black/20 text-[#b9ff4a]"><AdminIcon className="size-5" name="map" /></span>
                      <h2 className="text-xl font-extrabold tracking-[-0.02em] text-white">
                        {record.bookingCode}
                      </h2>
                      <AdminStatusBadge status={displayStatus} />
                    </div>
                    <dl className="mt-6 grid gap-x-5 gap-y-4 border-t border-white/[0.07] pt-5 text-sm sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                      <div>
                        <dt className="text-xs text-stone-500">Comprador</dt>
                        <dd className="mt-1 font-medium text-stone-200">
                          {record.buyer.fullName}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-stone-500">Fecha del tour</dt>
                        <dd className="mt-1 text-stone-200">
                          {formatBookingDate(record.selectedDate)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-stone-500">Modalidad</dt>
                        <dd className="mt-1 text-stone-200">
                          {adminModeLabel(record.mode)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-stone-500">Participantes</dt>
                        <dd className="mt-1 text-stone-200">{record.quantity}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-stone-500">Total</dt>
                        <dd className="mt-1 text-base font-extrabold text-white">
                          {formatCrc(record.total)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-stone-500">Creada</dt>
                        <dd className="mt-1 text-stone-200">
                          {formatAdminTimestamp(record.createdAt)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-stone-500">Comprobante</dt>
                        <dd className={`mt-1 inline-flex items-center gap-1.5 font-semibold ${record.paymentProof.id ? "text-emerald-200" : "text-stone-500"}`}>
                          <AdminIcon className="size-4" name={record.paymentProof.id ? "check" : "close"} />
                          {record.paymentProof.id ? "Adjunto" : "Sin archivo"}
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-xs text-stone-500">
                          Vencimiento de retención
                        </dt>
                        <dd className={`mt-1 inline-flex items-center gap-1.5 ${displayStatus === "expired" ? "font-semibold text-amber-200" : "text-stone-200"}`}>
                          <AdminIcon className="size-4" name="clock" />
                          {formatAdminTimestamp(record.pendingHoldUntil)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <Link
                    className="inline-flex min-h-[52px] w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-[#b9ff4a]/25 bg-[#b9ff4a]/[0.05] px-6 text-xs font-extrabold uppercase tracking-[0.1em] text-[#d0ff87] outline-none transition hover:border-[#b9ff4a]/50 hover:bg-[#b9ff4a]/10 focus-visible:ring-2 focus-visible:ring-[#b9ff4a]/35 sm:w-auto"
                    href={`/admin/reservas/${record.id}`}
                  >
                    Ver detalle <AdminIcon className="size-4" name="arrow" />
                  </Link>
                </div>
              </article>
            );
          })
        )}
      </section>
    </>
  );
}
