import Image from "next/image";
import Link from "next/link";

import { BookingWizard } from "@/components/booking/booking-wizard";
import { SiteFooter } from "@/components/navigation/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { TourDetailSection } from "@/components/tours/tour-detail-section";
import { TourList } from "@/components/tours/tour-list";
import { Badge } from "@/components/ui/badge";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Icon } from "@/components/ui/icon";
import { InViewReveal } from "@/components/ui/in-view-reveal";
import { ciudadEsmeraldaBookingConfig } from "@/lib/booking-config";
import { siteConfig } from "@/lib/site-config";
import {
  formatCrc,
  formatUsd,
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
  const isCiudadEsmeralda = tour.id.startsWith("ciudad-esmeralda-");
  const availableDetailLabels = detailLabels.filter(
    ([, field]) => tour[field],
  );

  return (
    <div className="min-h-screen bg-[#080a08] font-[family-name:var(--font-poppins)]">
      <SiteHeader />

      <main>
        <section className="relative isolate flex min-h-[78svh] items-end overflow-hidden">
          <Image
            alt={tour.imageAlt}
            className="motion-scale object-cover"
            fill
            priority
            sizes="100vw"
            src={tour.mainImage}
          />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(8,10,8,0.99)_0%,rgba(8,10,8,0.48)_53%,rgba(8,10,8,0.28)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,10,8,0.82),transparent_78%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_34%,rgba(185,255,74,0.08),transparent_28%)]" />

          <div className="motion-fade-up relative mx-auto w-full max-w-[90rem] px-6 pb-14 pt-32 sm:px-8 sm:pb-20 lg:px-12">
            <Link
              className="mb-10 inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/25 px-4 py-2 font-[family-name:var(--font-poppins)] text-[0.56rem] font-semibold uppercase tracking-[0.2em] text-stone-300 backdrop-blur-md transition-colors hover:border-[#b9ff4a]/40 hover:text-[#b9ff4a]"
              href="/explorar#tours"
            >
              <span aria-hidden="true">←</span>
              Volver a experiencias
            </Link>
            <div className="flex flex-wrap gap-2">
              <Badge
                className={
                  isCiudadEsmeralda
                    ? "!min-h-9 !rounded-full !border-[#b9ff4a]/35 !bg-[#b9ff4a]/[0.08] !px-4 !text-[#b9ff4a] shadow-[0_10px_35px_rgba(185,255,74,0.08)]"
                    : ""
                }
                tone="lava"
              >
                {tour.category}
              </Badge>
              {isCiudadEsmeralda &&
              tour.modalityLabel === "Sin transporte" ? null : (
                <Badge tone="smoke">{tour.modalityLabel}</Badge>
              )}
              {tour.temporaryImage ? (
                <Badge>
                  Fotografía provisional
                </Badge>
              ) : null}
            </div>
            <h1 className="text-balance mt-6 max-w-5xl font-[family-name:var(--font-manrope)] text-[clamp(3rem,7vw,6.8rem)] font-extrabold leading-[0.92] tracking-[-0.04em] text-white">
              {tour.name}
            </h1>
            <p className="mt-6 max-w-3xl font-[family-name:var(--font-poppins)] text-sm font-medium leading-7 text-stone-300 sm:text-base sm:leading-8">
              {tour.modality}
            </p>
          </div>
        </section>

        <section className="relative border-b border-[#b9ff4a]/10 bg-[#080a08]">
          <div className="mx-auto grid max-w-[90rem] grid-cols-2 gap-3 px-6 py-5 sm:px-8 md:grid-cols-4 lg:px-12">
            {availableDetailLabels.map(([label, field], index) => (
              <div
                className="motion-fade-up rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-5 backdrop-blur-md sm:px-6"
                key={field}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <p className="font-[family-name:var(--font-poppins)] text-[0.52rem] font-semibold uppercase tracking-[0.18em] text-[#b9ff4a]/70">
                  {label}
                </p>
                <p className="mt-2 font-[family-name:var(--font-manrope)] text-sm font-semibold leading-6 text-stone-200">
                  {tour[field]}
                </p>
              </div>
            ))}
          </div>
        </section>

        {isCiudadEsmeralda ? (
          <BookingWizard config={ciudadEsmeraldaBookingConfig} />
        ) : null}

        <div
          className={`relative mx-auto grid max-w-[90rem] gap-10 px-6 py-20 before:pointer-events-none before:absolute before:left-[-12rem] before:top-24 before:size-[28rem] before:rounded-full before:bg-[#b9ff4a]/[0.025] before:blur-3xl sm:px-8 lg:gap-14 lg:px-12 lg:py-28 ${
            isCiudadEsmeralda ? "" : "lg:grid-cols-[1fr_22rem]"
          }`}
        >
          <div className="space-y-4">
            <InViewReveal>
              <div className="pb-8">
                <p className="mb-4 font-[family-name:var(--font-poppins)] text-[0.58rem] font-semibold uppercase tracking-[0.28em] text-[#b9ff4a]">
                  La experiencia
                </p>
                <p className="max-w-4xl font-[family-name:var(--font-manrope)] text-3xl font-bold leading-[1.28] tracking-[-0.025em] text-stone-200 sm:text-4xl">
                  {tour.fullDescription}
                </p>
              </div>
            </InViewReveal>

            <TourDetailSection
              title={
                isCiudadEsmeralda
                  ? "Próximas fechas establecidas para el tour grupal con transporte desde la GAM"
                  : "Disponibilidad y fechas"
              }
            >
              <p>{tour.availabilityType}</p>
              {tour.officialDates.length > 0 ? (
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {tour.officialDates.map((date) => (
                    <li
                      className="rounded-xl border border-[#b9ff4a]/10 bg-[#b9ff4a]/[0.025] px-5 py-4 text-stone-300"
                      key={date.date}
                    >
                      <span className="mb-2 block font-semibold uppercase tracking-[0.18em] text-[#b9ff4a]">
                        {isCiudadEsmeralda
                          ? "Fecha oficial · transporte GAM"
                          : "Fecha oficial"}
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
              <p className="mt-5 border-l border-[#b9ff4a]/40 pl-4 text-stone-500">
                La publicación de una fecha no representa disponibilidad en
                tiempo real. Confirma siempre antes de reservar.
              </p>
            </TourDetailSection>

            <TourDetailSection title="Ubicación y encuentro">
              <div
                className={`grid gap-6 ${
                  tour.mapsQuery ? "lg:grid-cols-[0.8fr_1.2fr]" : ""
                }`}
              >
                <dl className="grid content-start gap-5 sm:grid-cols-2 lg:grid-cols-1">
                  <div>
                    <dt className="text-[0.52rem] uppercase tracking-[0.2em] text-stone-600">
                      Ubicación
                    </dt>
                    <dd className="mt-2 text-stone-300">{tour.location}</dd>
                  </div>
                  {tour.meetingPoint ? (
                    <div>
                      <dt className="text-[0.52rem] uppercase tracking-[0.2em] text-stone-600">
                        Punto de encuentro
                      </dt>
                      <dd className="mt-2 text-stone-300">
                        {tour.meetingPoint}
                      </dd>
                    </div>
                  ) : null}
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
                  <div className="min-h-72 overflow-hidden rounded-[1.5rem] border border-[#b9ff4a]/15 bg-black/20">
                    <iframe
                      allowFullScreen
                      className="h-full min-h-72 w-full border-0 grayscale-[0.15]"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps?q=${encodeURIComponent(
                        tour.mapsQuery,
                      )}&output=embed`}
                      title={`Mapa de referencia de ${tour.meetingPoint ?? tour.location}`}
                    />
                  </div>
                ) : null}
              </div>
              {tour.mapsQuery ? (
                <a
                  className="mt-6 inline-flex items-center gap-3 rounded-full border border-[#b9ff4a]/25 bg-[#b9ff4a]/[0.04] px-5 py-3 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[#b9ff4a] transition-colors hover:border-[#b9ff4a]/60 hover:bg-[#b9ff4a]/[0.08]"
                  href={getMapsSearchUrl(tour.mapsQuery)}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icon className="size-4" name="map" />
                  Buscar referencia en Maps
                </a>
              ) : null}
            </TourDetailSection>

            {isCiudadEsmeralda ? (
              <TourDetailSection
                eyebrow="Dos formas de reservar"
                title="Elige la modalidad que mejor se adapta a ti"
              >
                <div className="grid gap-5 lg:grid-cols-2">
                  <article className="rounded-[1.75rem] border border-[#b9ff4a]/20 bg-[#b9ff4a]/[0.04] p-6 sm:p-7">
                    <p className="text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-[#b9ff4a]">
                      {formatCrc(28000)} p. p. desde 2 · {formatCrc(35000)}{" "}
                      individual
                    </p>
                    <h3 className="mt-3 font-[family-name:var(--font-manrope)] text-2xl font-extrabold text-white">
                      Tour privado con llegada al punto de encuentro
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-stone-400">
                      Una persona o grupo llega por sus propios medios y vive la
                      experiencia de forma privada.
                    </p>
                    <h4 className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-stone-300">
                      Incluye
                    </h4>
                    <TourList
                      items={[
                        "Entrada al recorrido.",
                        "Equipo de seguridad para la actividad.",
                        "Acompañamiento de guías locales.",
                        "Contenido audiovisual de la experiencia.",
                        "Parqueo disponible en el punto de encuentro.",
                      ]}
                    />
                    <p className="mt-6 rounded-2xl border border-white/10 bg-black/15 p-4 text-sm leading-6 text-stone-400">
                      Alimentación opcional: agrega {formatCrc(5500)} por persona
                      durante la reserva.
                    </p>
                  </article>
                  <article className="rounded-[1.75rem] border border-[#b9ff4a]/20 bg-[#b9ff4a]/[0.04] p-6 sm:p-7">
                    <p className="text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-[#b9ff4a]">
                      {formatCrc(42000)} por persona
                    </p>
                    <h3 className="mt-3 font-[family-name:var(--font-manrope)] text-2xl font-extrabold text-white">
                      Tour grupal con transporte desde la GAM
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-stone-400">
                      Salida compartida desde puntos programados en la GAM, con
                      regreso incluido.
                    </p>
                    <h4 className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-stone-300">
                      Incluye
                    </h4>
                    <TourList
                      items={[
                        "Transporte ida y regreso desde el punto seleccionado.",
                        "Alimentación incluida.",
                        "Entrada al recorrido.",
                        "Equipo de seguridad para la actividad.",
                        "Acompañamiento de guías locales.",
                        "Contenido audiovisual de la experiencia.",
                      ]}
                    />
                    <p className="mt-6 rounded-2xl border border-white/10 bg-black/15 p-4 text-sm leading-6 text-stone-400">
                      El punto de salida se elige dentro del formulario de
                      reserva.
                    </p>
                  </article>
                </div>
                <p className="mt-5 text-sm leading-7 text-stone-500">
                  En ambas modalidades, los gastos personales y artículos no
                  especificados corren por cuenta de cada participante.
                </p>
              </TourDetailSection>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                <TourDetailSection title="Qué incluye">
                  <TourList items={tour.includes} />
                </TourDetailSection>
                {tour.excludes.length > 0 ? (
                  <TourDetailSection title="Qué no incluye">
                    <TourList items={tour.excludes} />
                  </TourDetailSection>
                ) : null}
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              {tour.whatToBring.length > 0 ? (
                <TourDetailSection title="Qué llevar">
                  <TourList items={tour.whatToBring} />
                </TourDetailSection>
              ) : null}
              {tour.recommendedEquipment.length > 0 ? (
                <TourDetailSection title="Equipo recomendado">
                  <TourList items={tour.recommendedEquipment} />
                </TourDetailSection>
              ) : null}
            </div>

            {tour.transportation && !isCiudadEsmeralda ? (
              <TourDetailSection title="Transporte y salidas">
                <p>{tour.transportation}</p>
                {tour.departurePoints.length > 0 ? (
                  <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {tour.departurePoints.map((point) => (
                      <li
                        className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4"
                        key={`${point.time}-${point.place}`}
                      >
                        {point.time ? (
                          <span className="shrink-0 font-[family-name:var(--font-manrope)] text-lg font-semibold text-[#b9ff4a]">
                            {point.time}
                          </span>
                        ) : null}
                        <span className="text-stone-300">{point.place}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {tour.departureNotice ? (
                  <p className="mt-5 border-l border-[#b9ff4a]/40 pl-4 text-stone-500">
                    {tour.departureNotice}
                  </p>
                ) : null}
              </TourDetailSection>
            ) : null}

            {tour.meals && !isCiudadEsmeralda ? (
              <TourDetailSection title="Alimentación">
                <p>{tour.meals}</p>
              </TourDetailSection>
            ) : null}

            {tour.physicalNotice ? (
              <TourDetailSection
                eyebrow="Importante"
                title="Condición física y seguridad"
              >
                <p>{tour.physicalNotice}</p>
              </TourDetailSection>
            ) : null}

            {tour.weatherNotice ? (
              <TourDetailSection title="Clima y seguridad">
                <p>{tour.weatherNotice}</p>
              </TourDetailSection>
            ) : null}

            {tour.cancellationPolicy.length > 0 ? (
              <TourDetailSection title="Política de reserva y cancelación">
                <TourList items={tour.cancellationPolicy} />
              </TourDetailSection>
            ) : null}
          </div>

          {!isCiudadEsmeralda ? (
            <aside className="lg:sticky lg:top-28 lg:self-start">
            <InViewReveal delay={120}>
            <GlassPanel className="rounded-[1.5rem] !border-[#b9ff4a]/15 !bg-[linear-gradient(145deg,rgba(185,255,74,0.055),rgba(255,255,255,0.025))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-7">
              <p className="text-[0.52rem] uppercase tracking-[0.22em] text-stone-600">
                {tour.priceUsd !== null
                  ? "Precio regular por persona"
                  : "Precio por persona"}
              </p>
              <p className="mt-2 font-[family-name:var(--font-manrope)] text-4xl font-extrabold text-[#b9ff4a]">
                {tour.priceUsd !== null
                  ? formatUsd(tour.priceUsd)
                  : formatCrc(tour.priceCrc)}
              </p>
              {tour.priceUsd !== null && tour.installmentPriceUsd ? (
                <>
                  <p className="mt-5 border-t border-white/10 pt-5 text-xs text-stone-500">
                    Plan flexible en cuotas
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-manrope)] text-2xl font-bold text-stone-200">
                    {formatUsd(tour.installmentPriceUsd)}
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-5 border-t border-white/10 pt-5 text-xs text-stone-500">
                    Reserva por persona
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-manrope)] text-2xl font-bold text-stone-200">
                    {formatCrc(tour.reservationAmountCrc)}
                  </p>
                </>
              )}

              <a
                className="mt-7 flex min-h-13 items-center justify-center gap-3 rounded-full bg-[#b9ff4a] px-5 py-4 text-center font-[family-name:var(--font-poppins)] text-[0.58rem] font-bold uppercase tracking-[0.18em] text-black shadow-[0_14px_40px_rgba(185,255,74,0.14)] transition hover:-translate-y-0.5 hover:bg-[#cbff7a]"
                href={
                  isCiudadEsmeralda
                    ? "#reservar-ciudad-esmeralda"
                    : whatsappUrl
                }
                rel={isCiudadEsmeralda ? undefined : "noopener noreferrer"}
                target={isCiudadEsmeralda ? undefined : "_blank"}
              >
                <Icon className="size-4" name="message" />
                {isCiudadEsmeralda
                  ? "Iniciar reserva"
                  : tour.priceUsd !== null
                  ? "Reservar por WhatsApp"
                  : "Consultar por WhatsApp"}
              </a>
              <p className="mt-4 text-center text-[0.6rem] leading-5 text-stone-600">
                La consulta no confirma automáticamente un cupo.
              </p>
            </GlassPanel>

            {tour.priceUsd === null ? (
              <GlassPanel className="mt-4 rounded-[1.5rem] !border-white/10 !bg-white/[0.025] p-6">
                <p className="text-[0.52rem] font-semibold uppercase tracking-[0.22em] text-[#b9ff4a]">
                  Información de pago
                </p>
                <p className="mt-5 text-xs uppercase tracking-[0.16em] text-stone-600">
                  SINPE Móvil
                </p>
                <p className="mt-1 font-[family-name:var(--font-manrope)] text-2xl font-bold text-stone-200">
                  {siteConfig.payments.sinpe.displayNumber}
                </p>
                <p className="mt-3 text-sm text-stone-400">
                  Titular: {siteConfig.payments.sinpe.holder}
                </p>
                <p className="mt-4 font-[family-name:var(--font-poppins)] text-xs font-medium leading-6 text-stone-600">
                  Confirma disponibilidad e instrucciones antes de realizar
                  cualquier pago. El sitio no procesa transferencias.
                </p>
              </GlassPanel>
            ) : null}
            </InViewReveal>
            </aside>
          ) : null}
        </div>

      </main>

      <SiteFooter />
    </div>
  );
}
