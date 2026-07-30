import Link from "next/link";

import { AdminIcon, type AdminIconName } from "@/components/admin/admin-icon";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { getAdminDisplayStatus } from "@/lib/admin-booking-ui";
import { calculateAdminMetrics } from "@/lib/admin-metrics";
import { BUSINESS_TIMEZONE } from "@/lib/system-config";
import { formatCrc } from "@/lib/tour-utils";
import type { BookingRecord, GroupTourDate } from "@/types/booking";

const dateFormatter = new Intl.DateTimeFormat("es-CR", {
  day: "numeric",
  month: "short",
  timeZone: BUSINESS_TIMEZONE,
  weekday: "short",
});

const timeFormatter = new Intl.DateTimeFormat("es-CR", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: BUSINESS_TIMEZONE,
});

function getGreeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      hourCycle: "h23",
      timeZone: BUSINESS_TIMEZONE,
    }).format(new Date()),
  );
  if (hour < 12) return "Buenos días";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
}

function safeQuantity(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : 0;
}

function formatTourDate(value: string) {
  const date = new Date(`${value}T12:00:00-06:00`);
  return Number.isNaN(date.getTime())
    ? "Fecha por confirmar"
    : dateFormatter.format(date);
}

function formatHold(value: string | null | undefined) {
  if (!value) return "Sin vencimiento registrado";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Vencimiento no disponible"
    : `${dateFormatter.format(date)}, ${timeFormatter.format(date)}`;
}

function validTimestamp(value: string | null | undefined) {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function MetricCard({
  accent,
  icon,
  label,
  note,
  value,
}: Readonly<{
  accent: string;
  icon: AdminIconName;
  label: string;
  note: string;
  value: string;
}>) {
  return (
    <article className="admin-panel group relative overflow-hidden rounded-[1.4rem] p-5 transition duration-300 hover:-translate-y-1 hover:border-white/[0.16]">
      <div className={`grid size-11 place-items-center rounded-xl border ${accent}`}>
        <AdminIcon className="size-5" name={icon} />
      </div>
      <strong className="mt-5 block text-4xl font-extrabold tracking-[-0.05em] text-white xl:text-5xl">
        {value}
      </strong>
      <p className="mt-2 text-sm font-semibold leading-5 text-stone-100">{label}</p>
      <p className="mt-1 text-xs leading-5 text-stone-500">{note}</p>
    </article>
  );
}

export function AdminOverview({
  adminName,
  bucketIsPrivate,
  records,
  upcomingTourDates,
}: Readonly<{
  adminName: string;
  bucketIsPrivate: boolean | null;
  records: BookingRecord[];
  upcomingTourDates: GroupTourDate[];
}>) {
  const approved = records.filter((record) => record.status === "approved" && !record.archivedAt);
  const pending = records.filter(
    (record) => !record.archivedAt && getAdminDisplayStatus(record) === "pending_review",
  );
  const dashboardMetrics = calculateAdminMetrics(records);
  const now = Date.now();
  const confirmedByDate = approved.reduce<Map<string, number>>((totals, record) => {
    if (!record.selectedDate) return totals;
    totals.set(
      record.selectedDate,
      (totals.get(record.selectedDate) ?? 0) + safeQuantity(record.quantity),
    );
    return totals;
  }, new Map());
  const firstDeparture = upcomingTourDates[0];
  const priorityRecords = [...pending]
    .sort((first, second) => {
      const firstHold = validTimestamp(first.pendingHoldUntil);
      const secondHold = validTimestamp(second.pendingHoldUntil);
      if (firstHold === null) return 1;
      if (secondHold === null) return -1;
      return firstHold - secondHold;
    })
    .slice(0, 3);
  const priorityCount = pending.length;

  const metrics = [
    {
      accent: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
      icon: "spark" as const,
      label: "Ingresos de hoy",
      note: "Confirmados hoy · hora de Costa Rica",
      value: formatCrc(dashboardMetrics.todayRevenue),
    },
    {
      accent: "border-[#b9ff4a]/20 bg-[#b9ff4a]/10 text-[#d0ff87]",
      icon: "calendar" as const,
      label: "Ingresos del mes",
      note: "Pagos confirmados durante el mes",
      value: formatCrc(dashboardMetrics.monthRevenue),
    },
    {
      accent: "border-teal-300/20 bg-teal-300/10 text-teal-200",
      icon: "map" as const,
      label: "Ingresos del año",
      note: "Pagos confirmados durante el año",
      value: formatCrc(dashboardMetrics.yearRevenue),
    },
    {
      accent: "border-sky-300/20 bg-sky-300/10 text-sky-200",
      icon: "clock" as const,
      label: "Reservas pendientes",
      note: "No contabilizadas como ingreso",
      value: String(dashboardMetrics.pendingBookings),
    },
    {
      accent: "border-[#b9ff4a]/20 bg-[#b9ff4a]/10 text-[#d0ff87]",
      icon: "check" as const,
      label: "Reservas confirmadas",
      note: "Aprobadas con pago verificado",
      value: String(dashboardMetrics.confirmedBookings),
    },
    {
      accent: "border-red-300/20 bg-red-300/10 text-red-200",
      icon: "close" as const,
      label: "Reservas canceladas",
      note: "No contabilizadas como ingreso",
      value: String(dashboardMetrics.cancelledBookings),
    },
    {
      accent: "border-violet-300/20 bg-violet-300/10 text-violet-200",
      icon: "document" as const,
      label: "Ticket promedio",
      note: "Ingreso confirmado por reserva",
      value: formatCrc(dashboardMetrics.averageTicket),
    },
    {
      accent: "border-amber-300/20 bg-amber-300/10 text-amber-200",
      icon: "users" as const,
      label: "Participantes confirmados",
      note: "Personas con pago verificado",
      value: String(dashboardMetrics.confirmedParticipants),
    },
  ];

  return (
    <div className="pb-8">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-gradient-to-br from-white/[0.055] via-white/[0.025] to-[#b9ff4a]/[0.035] px-5 py-7 shadow-2xl shadow-black/20 sm:px-8 sm:py-9 lg:px-10">
        <div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full border border-[#b9ff4a]/10 bg-[#b9ff4a]/[0.04] blur-sm" />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-[#b9ff4a]">
              <AdminIcon className="size-4" name="spark" />
              Centro de expedición
            </p>
            <h1 className="mt-4 max-w-4xl text-4xl font-extrabold tracking-[-0.055em] text-white sm:text-5xl lg:text-6xl">
              {getGreeting()}, {adminName}.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-400 sm:text-base">
              Este es el pulso operativo de reservas, salidas y participantes.
            </p>
          </div>
          <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/[0.09] bg-black/20 p-3 pr-5">
            <span className="relative grid size-12 shrink-0 place-items-center rounded-xl bg-emerald-300/10 text-emerald-200">
              <span className="absolute right-1 top-1 size-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.8)]" />
              <AdminIcon className="size-5" name="map" />
            </span>
            <div className="min-w-0">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-stone-500">
                Estado operativo
              </p>
              <p className="mt-1 truncate text-sm font-bold text-white">
                {priorityCount
                  ? `${priorityCount} ${priorityCount === 1 ? "prioridad activa" : "prioridades activas"}`
                  : "Sin pendientes críticos"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="summary-title" className="mt-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-stone-500">
              Vista general
            </p>
            <h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-white" id="summary-title">
              Resumen operativo
            </h2>
          </div>
          <span className="hidden text-xs text-stone-500 sm:block">Datos en tiempo real</span>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => <MetricCard {...metric} key={metric.label} />)}
        </div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="admin-panel overflow-hidden rounded-[1.75rem]" aria-labelledby="priorities-title">
          <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] px-5 py-5 sm:px-7">
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-amber-200">Atención</p>
              <h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-white" id="priorities-title">Prioridades</h2>
            </div>
            <span className="grid size-11 place-items-center rounded-xl border border-amber-300/15 bg-amber-300/[0.07] text-amber-200">
              <AdminIcon className="size-5" name="clock" />
            </span>
          </div>
          <div className="p-3 sm:p-4">
            {priorityRecords.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 px-5 py-8 text-center">
                <span className="mx-auto grid size-11 place-items-center rounded-full bg-emerald-300/10 text-emerald-200">
                  <AdminIcon className="size-5" name="check" />
                </span>
                <h3 className="mt-3 text-sm font-bold text-white">Revisión al día</h3>
                <p className="mt-1 text-xs leading-5 text-stone-500">No hay reservas pendientes.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {priorityRecords.map((record) => {
                  const hold = validTimestamp(record.pendingHoldUntil);
                  return (
                    <li className="rounded-2xl border border-white/[0.07] bg-black/15 p-4" key={record.id}>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <strong className="text-sm text-white">{record.bookingCode}</strong>
                            <AdminStatusBadge status="pending_review" />
                          </div>
                          <p className="mt-2 truncate text-xs text-stone-400">
                            {record.buyer.fullName} · {formatTourDate(record.selectedDate)}
                          </p>
                          <p className={`mt-1 flex items-center gap-1.5 text-xs ${hold && hold > now ? "text-amber-200" : "text-stone-500"}`}>
                            <AdminIcon className="size-3.5" name="clock" />
                            {hold && hold > now ? `Retención: ${formatHold(record.pendingHoldUntil)}` : "Sin retención activa"}
                          </p>
                        </div>
                        <Link className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#b9ff4a]/25 bg-[#b9ff4a]/[0.06] px-4 text-xs font-extrabold text-[#d0ff87] transition hover:bg-[#b9ff4a]/10" href={`/admin/reservas/${record.id}`}>
                          Revisar <AdminIcon className="size-4" name="arrow" />
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <section className="admin-panel overflow-hidden rounded-[1.75rem]" aria-labelledby="departures-title">
          <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] px-5 py-5 sm:px-7">
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-violet-200">Calendario</p>
              <h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-white" id="departures-title">Próximas salidas</h2>
            </div>
            <span className="grid size-11 place-items-center rounded-xl border border-violet-300/15 bg-violet-300/[0.07] text-violet-200">
              <AdminIcon className="size-5" name="calendar" />
            </span>
          </div>
          <div className="p-3 sm:p-4">
            {upcomingTourDates.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/10 px-5 py-8 text-center text-sm text-stone-500">
                No hay salidas activas programadas.
              </p>
            ) : (
              <ol className="space-y-2">
                {upcomingTourDates.slice(0, 4).map((departure, index) => {
                  const confirmed = confirmedByDate.get(departure.date) ?? 0;
                  const capacity = safeQuantity(departure.capacity);
                  return (
                    <li className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-black/15 p-4" key={departure.id}>
                      <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-violet-300/[0.08] text-center">
                        <span className="text-[0.62rem] font-bold uppercase leading-3 text-violet-200">{index === 0 ? "Próx." : "Ruta"}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <strong className="text-sm capitalize text-white">{formatTourDate(departure.date)}</strong>
                          <span className="inline-flex rounded-full border border-emerald-300/15 bg-emerald-300/[0.07] px-2 py-1 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-emerald-200">Activa</span>
                        </div>
                        <p className="mt-1 truncate text-xs text-stone-400">{departure.tourName}</p>
                        <p className="mt-1 text-xs text-stone-500">
                          {confirmed} confirmados{capacity > 0 ? ` · ${capacity} cupos totales` : ""}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="admin-panel rounded-[1.75rem] p-5 sm:p-7" aria-labelledby="system-title">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-emerald-300/10 text-emerald-200">
              <AdminIcon className="size-5" name="shield" />
            </span>
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-stone-500">Infraestructura</p>
              <h2 className="text-lg font-extrabold text-white" id="system-title">Estado del sistema</h2>
            </div>
          </div>
          <ul className="mt-5 divide-y divide-white/[0.07]">
            {[
              ["Conexión con Supabase", "Conectada", true],
              ["Bucket de comprobantes", bucketIsPrivate === null ? "No verificado" : bucketIsPrivate ? "Privado" : "Revisar privacidad", bucketIsPrivate === true],
              ["Panel administrativo", "Operativo", true],
            ].map(([label, value, healthy]) => (
              <li className="flex min-h-12 items-center justify-between gap-4 py-3 text-xs" key={String(label)}>
                <span className="text-stone-400">{label}</span>
                <span className={`inline-flex items-center gap-2 font-bold ${healthy ? "text-emerald-200" : "text-amber-200"}`}>
                  <span className={`size-2 rounded-full ${healthy ? "bg-emerald-300" : "bg-amber-300"}`} />
                  {value}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="admin-panel relative overflow-hidden rounded-[1.75rem] p-5 sm:p-7" aria-labelledby="actions-title">
          <div className="pointer-events-none absolute -bottom-24 -right-16 size-56 rounded-full bg-[#b9ff4a]/[0.06] blur-3xl" />
          <div className="relative">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#b9ff4a]">Navegación</p>
            <h2 className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-white" id="actions-title">Acciones rápidas</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Link className="group flex min-h-[76px] items-center justify-between gap-3 rounded-2xl border border-[#b9ff4a]/20 bg-[#b9ff4a]/[0.06] p-4 text-sm font-bold text-white transition hover:bg-[#b9ff4a]/10" href="/admin/reservas">
                <span><small className="mb-1 block text-[0.62rem] uppercase tracking-[0.12em] text-[#b9ff4a]">{pending.length}</small>Revisar pendientes</span>
                <AdminIcon className="size-5 text-[#b9ff4a] transition group-hover:translate-x-1" name="arrow" />
              </Link>
              <Link className="group flex min-h-[76px] items-center justify-between gap-3 rounded-2xl border border-white/[0.09] bg-white/[0.025] p-4 text-sm font-bold text-white transition hover:bg-white/[0.05]" href="/admin/reservas">
                <span><small className="mb-1 block text-[0.62rem] uppercase tracking-[0.12em] text-stone-500">{records.length}</small>Ver todas las reservas</span>
                <AdminIcon className="size-5 text-stone-400 transition group-hover:translate-x-1" name="arrow" />
              </Link>
              {firstDeparture ? (
                <Link className="group flex min-h-[76px] items-center justify-between gap-3 rounded-2xl border border-white/[0.09] bg-white/[0.025] p-4 text-sm font-bold text-white transition hover:bg-white/[0.05]" href={`/admin/reservas?fecha=${firstDeparture.date}`}>
                  <span><small className="mb-1 block capitalize text-[0.62rem] uppercase tracking-[0.12em] text-violet-200">{formatTourDate(firstDeparture.date)}</small>Ir a la próxima salida</span>
                  <AdminIcon className="size-5 text-violet-200 transition group-hover:translate-x-1" name="arrow" />
                </Link>
              ) : (
                <div aria-disabled="true" className="flex min-h-[76px] items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4 text-sm font-bold text-stone-500">
                  Sin próxima salida <AdminIcon className="size-5" name="calendar" />
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
