import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ReservationActions } from "@/components/admin/reservation-actions";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { formatBookingDate } from "@/lib/booking-date";
import {
  adminModeLabel,
  adminStatusLabels,
  formatAdminTimestamp,
  getAdminDisplayStatus,
} from "@/lib/admin-booking-ui";
import { requireActiveAdmin } from "@/lib/admin-auth";
import { getAdminBooking } from "@/lib/admin-bookings";
import { formatCrc } from "@/lib/tour-utils";
import { AdminIcon } from "@/components/admin/admin-icon";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Detalle de reserva" };

export default async function ReservationDetailPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { supabase } = await requireActiveAdmin();
  const record = await getAdminBooking(supabase, (await params).id);
  if (!record) notFound();

  const displayStatus = getAdminDisplayStatus(record);
  const actions = [...(record.adminActions ?? [])].sort((first, second) =>
    second.createdAt.localeCompare(first.createdAt),
  );
  const transport =
    record.mode === "gam_transport"
      ? record.transportDetails.gam_transport.departurePoint
      : record.mode === "private"
        ? record.transportDetails.private.pickupZone
        : [
            record.transportDetails.direct.transportMethod,
            record.transportDetails.direct.arrivalTime,
          ]
            .filter(Boolean)
            .join(" · ");

  return (
    <>
      <Link
        className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/10 px-4 text-xs font-semibold text-stone-400 outline-none transition hover:border-white/25 hover:text-white focus-visible:ring-2 focus-visible:ring-white/30"
        href="/admin/reservas"
      >
        <span aria-hidden="true">←</span> Volver a reservas
      </Link>

      <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9ff4a]">
            Detalle de reserva
          </p>
          <h1 className="mt-3 break-words text-4xl font-extrabold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
            {record.bookingCode}
          </h1>
          <div className="mt-4">
            <AdminStatusBadge status={displayStatus} />
          </div>
        </div>
        <div className="admin-panel rounded-xl px-5 py-4 text-sm">
          <span className="text-stone-500">Creada</span>
          <strong className="mt-1 block text-white">
            {formatAdminTimestamp(record.createdAt)}
          </strong>
        </div>
      </div>

      <div className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="space-y-5">
          <section className="admin-panel rounded-[1.5rem] p-5 sm:p-7">
            <h2 className="flex items-center gap-3 text-xl font-extrabold text-white">
              <span className="grid size-10 place-items-center rounded-xl bg-[#b9ff4a]/10 text-[#b9ff4a]"><AdminIcon className="size-5" name="map" /></span> Reserva
            </h2>
            <dl className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Tour", record.tourName],
                ["Fecha", formatBookingDate(record.selectedDate)],
                ["Modalidad", adminModeLabel(record.mode)],
                ["Participantes", String(record.quantity)],
                ["Precio por persona", formatCrc(record.pricePerPersonCrc)],
                ["Total", formatCrc(record.total)],
                ["Estado", adminStatusLabels[displayStatus]],
                [
                  "Vencimiento de retención",
                  formatAdminTimestamp(record.pendingHoldUntil),
                ],
                ["Detalle de traslado", transport || "No aplica"],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-stone-500">{label}</dt>
                  <dd className="mt-1 break-words text-sm font-medium text-stone-200">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            {record.adminNotes ? (
              <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4">
                <p className="text-xs font-semibold text-amber-200">
                  Nota asociada al último cambio de estado
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-300">
                  {record.adminNotes}
                </p>
              </div>
            ) : null}
          </section>

          <section className="admin-panel rounded-[1.5rem] p-5 sm:p-7">
            <h2 className="flex items-center gap-3 text-xl font-extrabold text-white">
              <span className="grid size-10 place-items-center rounded-xl bg-sky-300/10 text-sky-200"><AdminIcon className="size-5" name="user" /></span> Comprador
            </h2>
            <dl className="mt-5 grid gap-5 sm:grid-cols-3">
              <div>
                <dt className="text-xs text-stone-500">Nombre completo</dt>
                <dd className="mt-1 break-words text-sm text-stone-200">
                  {record.buyer.fullName}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-stone-500">Correo electrónico</dt>
                <dd className="mt-1 break-words text-sm text-stone-200">
                  {record.buyer.email}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-stone-500">Teléfono</dt>
                <dd className="mt-1 break-words text-sm text-stone-200">
                  {record.buyer.phone}
                </dd>
              </div>
            </dl>
          </section>

          <section className="admin-panel rounded-[1.5rem] p-5 sm:p-7">
            <h2 className="flex items-center gap-3 text-xl font-extrabold text-white">
              <span className="grid size-10 place-items-center rounded-xl bg-amber-300/10 text-amber-200"><AdminIcon className="size-5" name="users" /></span> Participantes
            </h2>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {record.participants.map((participant, index) => (
                <article
                  className="rounded-[1.25rem] border border-white/[0.08] bg-black/20 p-5 transition hover:border-white/[0.14]"
                  key={participant.id}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#b9ff4a]">
                    Participante {index + 1}
                  </p>
                  <h3 className="mt-2 font-semibold text-white">
                    {participant.fullName}
                  </h3>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="text-xs text-stone-500">Teléfono</dt>
                      <dd className="mt-1 text-stone-300">{participant.phone}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-stone-500">Condición física</dt>
                      <dd className="mt-1 whitespace-pre-wrap text-stone-300">
                        {participant.fitness}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-stone-500">
                        Condición médica o alergia
                      </dt>
                      <dd className="mt-1 whitespace-pre-wrap text-stone-300">
                        {participant.hasMedicalCondition === "yes"
                          ? participant.medicalDetails
                          : "No reporta"}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
            <p className="mt-5 text-sm leading-6 text-stone-400">
              <span className="font-semibold text-stone-200">
                Restricciones alimentarias:
              </span>{" "}
              {record.foodDetails.hasDietaryRestriction === "yes"
                ? record.foodDetails.dietaryDetails
                : "No reporta"}
            </p>
          </section>

          <section className="admin-panel rounded-[1.5rem] p-5 sm:p-7">
            <h2 className="flex items-center gap-3 text-xl font-extrabold text-white">
              <span className="grid size-10 place-items-center rounded-xl bg-violet-300/10 text-violet-200"><AdminIcon className="size-5" name="note" /></span> Historial administrativo
            </h2>
            {actions.length ? (
              <ol className="mt-5 space-y-3">
                {actions.map((action) => (
                  <li
                    className="relative rounded-xl border border-white/[0.08] bg-black/20 p-4 pl-6 before:absolute before:bottom-4 before:left-0 before:top-4 before:w-0.5 before:bg-[#b9ff4a]/40"
                    key={action.id}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <strong className="text-sm text-white">
                        {action.action === "submitted"
                          ? "Solicitud recibida"
                          : action.action === "note_added"
                            ? "Nota administrativa"
                            : adminStatusLabels[action.newStatus]}
                      </strong>
                      <time className="text-xs text-stone-500">
                        {formatAdminTimestamp(action.createdAt)}
                      </time>
                    </div>
                    {action.reason ? (
                      <p className="mt-2 text-sm text-stone-300">
                        Motivo: {action.reason}
                      </p>
                    ) : null}
                    {action.notes ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-400">
                        {action.notes}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-stone-600">
                      {action.actorId
                        ? "Operación de administrador autenticado"
                        : "Operación del sistema"}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-4 text-sm text-stone-400">
                Todavía no hay acciones registradas.
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
          <ReservationActions
            bookingCode={record.bookingCode}
            bookingId={record.id}
            status={record.status}
          />
          <section className="admin-panel rounded-[1.5rem] p-5 sm:p-6">
            <h2 className="flex items-center gap-3 text-xl font-extrabold text-white">
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-300/10 text-emerald-200"><AdminIcon className="size-5" name="document" /></span> Comprobante
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-400">
              Se abrirá mediante una URL privada con vigencia de 60 segundos.
            </p>
            <a
              className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl border border-[#b9ff4a]/25 bg-[#b9ff4a]/[0.05] px-5 text-center text-xs font-bold uppercase tracking-[0.1em] text-[#d0ff87] outline-none transition hover:bg-[#b9ff4a]/10 focus-visible:ring-2 focus-visible:ring-[#b9ff4a]/35"
              href={`/api/admin/reservas/${record.id}/comprobante`}
              rel="noreferrer"
              target="_blank"
            >
              Ver comprobante privado <AdminIcon className="size-4" name="arrow" />
            </a>
          </section>
        </aside>
      </div>
    </>
  );
}
