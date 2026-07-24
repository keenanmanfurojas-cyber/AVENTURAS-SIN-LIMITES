import Image from "next/image";
import Link from "next/link";

import { SiteFooter } from "@/components/navigation/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { TourDetailSection } from "@/components/tours/tour-detail-section";
import { TourList } from "@/components/tours/tour-list";
import { Badge } from "@/components/ui/badge";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Icon } from "@/components/ui/icon";
import { siteConfig } from "@/lib/site-config";
import {
  formatCrc,
  getMapsSearchUrl,
  getTourWhatsAppUrl,
} from "@/lib/tour-utils";
import type { Tour } from "@/types/content";

type TourDetailPageProps = Readonly<{
  tour: Tour;
}>;

const detailLabels = [
  ["Dificultad", "difficulty"],
  ["Distancia", "distance"],
  ["Duración", "duration"],
  ["Hora de inicio", "startTime"],
] as const;

export function TourDetailPage({ tour }: TourDetailPageProps) {
  const whatsappUrl = getTourWhatsAppUrl(tour);

  return (
    <div className="min-h-screen bg-obsidian pt-20">
      <SiteHeader />

      <main>
        <section className="relative isolate flex min-h-[72svh] items-end overflow-hidden">
          <Image
            alt={tour.imageAlt}
            className="object-cover"
            fill
            priority
            sizes="100vw"
            src={tour.mainImage}
          />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(7,6,6,0.98)_0%,rgba(7,6,6,0.42)_55%,rgba(7,6,6,0.34)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,6,6,0.74),transparent_75%)]" />

          <div className="relative mx-auto w-full max-w-[90rem] px-6 pb-14 pt-28 sm:px-8 sm:pb-20 lg:px-12">
            <Link
              className="mb-10 inline-flex items-center gap-3 text-[0.56rem] font-semibold uppercase tracking-[0.24em] text-stone-300 transition-colors hover:text-sand"
              href="/#tours"
            >
              <span aria-hidden="true">←</span>
              Volver a experiencias
            </Link>
            <div className="flex flex-wrap gap-2">
              <Badge tone="lava">
                {tour.category}
              </Badge>
              <Badge tone="smoke">
                {tour.modalityLabel}
              </Badge>
              {tour.temporaryImage ? (
                <Badge>
                  Fotografía provisional
                </Badge>
              ) : null}
            </div>
            <h1 className="text-balance mt-6 max-w-5xl font-display text-[clamp(3rem,7vw,6.8rem)] leading-[0.92] tracking-[-0.04em] text-white">
              {tour.name}
            </h1>
            <p className="mt-6 max-w-3xl text-sm font-light leading-7 text-stone-300 sm:text-base sm:leading-8">
              {tour.modality}
            </p>
          </div>
        </section>

        <section className="border-b border-white/10 bg-charcoal">
          <div className="mx-auto grid max-w-[90rem] grid-cols-2 divide-x divide-y divide-white/10 px-6 sm:px-8 md:grid-cols-4 md:divide-y-0 lg:px-12">
            {detailLabels.map(([label, field]) => (
              <div className="px-4 py-7 sm:px-7" key={field}>
                <p className="text-[0.5rem] uppercase tracking-[0.2em] text-stone-600">
                  {label}
                </p>
                <p className="mt-2 text-sm leading-6 text-stone-300">
                  {tour[field]}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="mx-auto grid max-w-[90rem] gap-14 px-6 py-20 sm:px-8 lg:grid-cols-[1fr_22rem] lg:gap-20 lg:px-12 lg:py-28">
          <div>
            <div className="pb-10">
              <p className="mb-4 text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-moss">
                La experiencia
              </p>
              <p className="max-w-3xl font-display text-3xl leading-[1.35] text-stone-200 sm:text-4xl">
                {tour.fullDescription}
              </p>
            </div>

            <TourDetailSection title="Disponibilidad y fechas">
              <p>{tour.availabilityType}</p>
              {tour.officialDates.length > 0 ? (
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {tour.officialDates.map((date) => (
                    <li
                      className="border border-white/10 bg-white/[0.02] px-5 py-4 text-stone-300"
                      key={date.date}
                    >
                      <span className="mb-2 block text-[0.5rem] uppercase tracking-[0.2em] text-sand">
                        Fecha oficial
                      </span>
                      {date.label}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-stone-500">
                  No existe una fecha automática publicada. La salida se
                  coordina previamente.
                </p>
              )}
              <p className="mt-5 border-l border-sand/40 pl-4 text-stone-500">
                La publicación de una fecha no representa disponibilidad en
                tiempo real. Confirma siempre antes de reservar.
              </p>
            </TourDetailSection>

            <TourDetailSection title="Ubicación y encuentro">
              <dl className="grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="text-[0.52rem] uppercase tracking-[0.2em] text-stone-600">
                    Ubicación
                  </dt>
                  <dd className="mt-2 text-stone-300">{tour.location}</dd>
                </div>
                <div>
                  <dt className="text-[0.52rem] uppercase tracking-[0.2em] text-stone-600">
                    Punto de encuentro
                  </dt>
                  <dd className="mt-2 text-stone-300">
                    {tour.meetingPoint ?? "Pendiente de confirmación."}
                  </dd>
                </div>
                {tour.parking ? (
                  <div>
                    <dt className="text-[0.52rem] uppercase tracking-[0.2em] text-stone-600">
                      Parqueo
                    </dt>
                    <dd className="mt-2 text-stone-300">{tour.parking}</dd>
                  </div>
                ) : null}
                {tour.temperature ? (
                  <div>
                    <dt className="text-[0.52rem] uppercase tracking-[0.2em] text-stone-600">
                      Temperatura estimada
                    </dt>
                    <dd className="mt-2 text-stone-300">
                      {tour.temperature}
                    </dd>
                  </div>
                ) : null}
              </dl>
              {tour.mapsQuery ? (
                <a
                  className="mt-6 inline-flex items-center gap-3 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-sand underline decoration-sand/30 underline-offset-4"
                  href={getMapsSearchUrl(tour.mapsQuery)}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icon className="size-4" name="map" />
                  Buscar referencia en Maps
                </a>
              ) : null}
            </TourDetailSection>

            <div className="grid gap-x-14 lg:grid-cols-2">
              <TourDetailSection title="Qué incluye">
                <TourList items={tour.includes} />
              </TourDetailSection>
              <TourDetailSection title="Qué no incluye">
                <TourList
                  emptyLabel="No se proporcionó una lista oficial de exclusiones para esta modalidad. Confirma los detalles antes de reservar."
                  items={tour.excludes}
                />
              </TourDetailSection>
              <TourDetailSection title="Qué llevar">
                <TourList items={tour.whatToBring} />
              </TourDetailSection>
              <TourDetailSection title="Equipo recomendado">
                <TourList items={tour.recommendedEquipment} />
              </TourDetailSection>
            </div>

            <TourDetailSection title="Transporte y salidas">
              <p>{tour.transportation}</p>
              {tour.departurePoints.length > 0 ? (
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {tour.departurePoints.map((point) => (
                    <li
                      className="flex gap-4 border border-white/10 px-5 py-4"
                      key={`${point.time}-${point.place}`}
                    >
                      {point.time ? (
                        <span className="shrink-0 font-display text-lg text-sand">
                          {point.time}
                        </span>
                      ) : null}
                      <span className="text-stone-300">{point.place}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {tour.departureNotice ? (
                <p className="mt-5 border-l border-sand/40 pl-4 text-stone-500">
                  {tour.departureNotice}
                </p>
              ) : null}
            </TourDetailSection>

            <TourDetailSection title="Alimentación">
              <p>{tour.meals}</p>
            </TourDetailSection>

            {tour.physicalNotice ? (
              <TourDetailSection
                eyebrow="Importante"
                title="Condición física y seguridad"
              >
                <p>{tour.physicalNotice}</p>
              </TourDetailSection>
            ) : null}

            <TourDetailSection title="Clima y seguridad">
              <p>{tour.weatherNotice}</p>
            </TourDetailSection>

            <TourDetailSection title="Política de reserva y cancelación">
              <TourList items={tour.cancellationPolicy} />
            </TourDetailSection>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <GlassPanel className="p-6 sm:p-7">
              <p className="text-[0.52rem] uppercase tracking-[0.22em] text-stone-600">
                Precio por persona
              </p>
              <p className="mt-2 font-display text-4xl text-sand">
                {formatCrc(tour.priceCrc)}
              </p>
              <p className="mt-5 border-t border-white/10 pt-5 text-xs text-stone-500">
                Reserva por persona
              </p>
              <p className="mt-1 font-display text-2xl text-stone-200">
                {formatCrc(tour.reservationAmountCrc)}
              </p>

              <a
                className="mt-7 flex min-h-13 items-center justify-center gap-3 bg-sand px-5 py-4 text-center text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-obsidian transition-colors hover:bg-stone-100"
                href={whatsappUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Icon className="size-4" name="message" />
                Consultar por WhatsApp
              </a>
              <p className="mt-4 text-center text-[0.6rem] leading-5 text-stone-600">
                La consulta no confirma automáticamente un cupo.
              </p>
            </GlassPanel>

            <GlassPanel className="mt-4 p-6">
              <p className="text-[0.52rem] font-semibold uppercase tracking-[0.22em] text-moss">
                Información de pago
              </p>
              <p className="mt-5 text-xs uppercase tracking-[0.16em] text-stone-600">
                SINPE Móvil
              </p>
              <p className="mt-1 font-display text-2xl text-stone-200">
                {siteConfig.payments.sinpe.displayNumber}
              </p>
              <p className="mt-3 text-sm text-stone-400">
                Titular: {siteConfig.payments.sinpe.holder}
              </p>
              <p className="mt-4 text-xs font-light leading-6 text-stone-600">
                Confirma disponibilidad e instrucciones antes de realizar
                cualquier pago. El sitio no procesa transferencias.
              </p>
            </GlassPanel>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
