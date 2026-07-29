import Image from "next/image";
import Link from "next/link";

import { Icon } from "@/components/ui/icon";
import { formatCrc, formatUsd } from "@/lib/tour-utils";
import { isTourComingSoon } from "@/lib/tours-data";
import type { Tour } from "@/types/content";

type TourCardProps = Readonly<{
  index: number;
  tour: Tour;
}>;

export function TourCard({ index, tour }: TourCardProps) {
  const comingSoon = isTourComingSoon(tour);
  const formattedPrice =
    tour.priceUsd !== null
      ? formatUsd(tour.priceUsd)
      : formatCrc(tour.priceCrc);

  return (
    <article className="editorial-tour group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-[#b9ff4a]/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.055),rgba(13,18,13,0.78)_42%,rgba(7,9,7,0.94))] p-3 shadow-[0_28px_90px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-5">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.35rem] bg-charcoal">
        <Image
          alt={tour.imageAlt}
          className="object-cover transition-transform duration-[1200ms] ease-refined group-hover:scale-[1.025]"
          fill
          sizes="(min-width: 1280px) 30vw, (min-width: 768px) 48vw, 100vw"
          src={tour.mainImage}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
        {comingSoon ? (
          <div
            aria-label="Disponible muy pronto"
            className="tour-coming-soon-ribbon absolute -right-14 top-8 z-10 w-56 rotate-[32deg] overflow-hidden border-y border-[#f4df9a]/35 bg-[linear-gradient(90deg,#6f351f,#b9673f_48%,#6f351f)] px-4 py-2.5 text-center shadow-[0_12px_30px_rgba(0,0,0,0.38)] sm:-right-12 sm:top-10 sm:w-60"
          >
            <span className="relative z-10 font-[family-name:var(--font-manrope)] text-[0.56rem] font-extrabold uppercase tracking-[0.14em] text-[#fff4d4] sm:text-[0.6rem]">
              Disponible muy pronto
            </span>
          </div>
        ) : null}
        <p className="absolute left-5 top-5 rounded-full border border-[#b9ff4a]/25 bg-black/45 px-4 py-2 font-[family-name:var(--font-poppins)] text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-[#d8ff9d] backdrop-blur-md sm:left-7 sm:top-7">
          {tour.category}
        </p>
        {tour.temporaryImage ? (
          <p className="absolute right-5 top-5 max-w-32 rounded-full bg-black/55 px-3 py-2 text-right text-[0.48rem] uppercase tracking-[0.13em] text-stone-300 backdrop-blur-sm sm:right-7 sm:top-7">
            Imagen provisional
          </p>
        ) : null}
        <p className="absolute bottom-6 left-6 font-[family-name:var(--font-manrope)] text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-white/80 sm:bottom-8 sm:left-8">
          {tour.location === "Guatemala"
            ? "Guatemala"
            : "San Carlos · Costa Rica"}
        </p>
      </div>

      <div className="flex flex-1 flex-col justify-between px-2 pb-3 pt-7 sm:px-3">
        <div>
          <div className="flex items-center justify-between gap-6">
            <p className="font-[family-name:var(--font-manrope)] text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#b9ff4a]">
              Experiencia {String(index + 1).padStart(2, "0")}
            </p>
            <p className="font-[family-name:var(--font-manrope)] text-5xl font-extrabold tracking-[-0.06em] text-white/[0.09]">
              {String(index + 1).padStart(2, "0")}
            </p>
          </div>

          <h3 className="mt-7 max-w-xl font-[family-name:var(--font-manrope)] text-[clamp(2rem,3vw,3rem)] font-extrabold leading-[0.96] tracking-[-0.045em] text-white">
            {tour.name}
          </h3>

          <p className="mt-6 flex items-start gap-3 font-[family-name:var(--font-poppins)] text-sm font-medium leading-6 text-stone-300">
            <Icon className="mt-0.5 size-4 shrink-0 text-[#b9ff4a]" name="map" />
            {tour.location}
          </p>

          <p className="mt-7 max-w-xl font-[family-name:var(--font-poppins)] text-sm font-medium leading-7 text-stone-400 sm:text-base sm:leading-8">
            {tour.shortDescription}
          </p>
        </div>

        <div className="mt-9">
          <dl className="grid grid-cols-1 gap-4 rounded-2xl bg-white/[0.035] p-5 sm:grid-cols-2 sm:gap-x-6">
            <div>
              <dt className="font-[family-name:var(--font-manrope)] text-xs font-bold uppercase tracking-[0.14em] text-stone-400">
                Duración
              </dt>
              <dd className="mt-2 font-[family-name:var(--font-manrope)] text-base font-semibold text-stone-200">{tour.duration}</dd>
            </div>
            <div>
              <dt className="font-[family-name:var(--font-manrope)] text-xs font-bold uppercase tracking-[0.14em] text-stone-400">
                Dificultad
              </dt>
              <dd className="mt-2 font-[family-name:var(--font-manrope)] text-base font-semibold text-stone-200">
                {tour.difficulty}
              </dd>
            </div>
          </dl>

          <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-[family-name:var(--font-manrope)] text-xs font-bold uppercase tracking-[0.14em] text-stone-400">
                Por persona
              </p>
              <p className="mt-2 font-[family-name:var(--font-manrope)] text-3xl font-extrabold tracking-[-0.04em] text-white">
                {tour.priceUsd !== null ? formattedPrice : `Desde ${formattedPrice}`}
              </p>
            </div>
            {comingSoon ? (
              <div
                aria-disabled="true"
                className="inline-flex min-h-12 cursor-default items-center justify-center rounded-xl border border-[#d4875f]/30 bg-[#9f5130]/10 px-6 text-center font-[family-name:var(--font-poppins)] text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[#e9b99f]"
              >
                Disponible muy pronto
              </div>
            ) : (
              <Link
                className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-[#b9ff4a]/35 bg-[#b9ff4a]/[0.06] px-6 font-[family-name:var(--font-poppins)] text-[0.58rem] font-bold uppercase tracking-[0.16em] text-white transition hover:border-[#b9ff4a] hover:bg-[#b9ff4a] hover:text-black"
                href={`/tours/${tour.slug}`}
              >
                Ver experiencia
                <Icon
                  className="size-4 transition-transform duration-500 group-hover:translate-x-1"
                  name="arrow"
                />
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
