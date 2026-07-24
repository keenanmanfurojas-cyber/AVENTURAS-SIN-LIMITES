import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { formatCrc } from "@/lib/tour-utils";
import type { Tour } from "@/types/content";

type TourCardProps = Readonly<{
  index: number;
  tour: Tour;
}>;

export function TourCard({ index, tour }: TourCardProps) {
  const mediaOrder = index % 2 === 0 ? "lg:order-1" : "lg:order-2";
  const contentOrder = index % 2 === 0 ? "lg:order-2" : "lg:order-1";

  return (
    <article className="editorial-tour group grid gap-7 border-t border-white/15 py-10 sm:py-14 lg:grid-cols-12 lg:items-stretch lg:gap-12 lg:py-20">
      <div
        className={`relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-charcoal sm:aspect-[16/10] lg:col-span-7 lg:min-h-[32rem] ${mediaOrder}`}
      >
        <Image
          alt={tour.imageAlt}
          className="object-cover transition-transform duration-[1200ms] ease-refined group-hover:scale-[1.025]"
          fill
          sizes="(min-width: 1024px) 58vw, 100vw"
          src={tour.mainImage}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
        <Badge
          className="absolute left-5 top-5 rounded-full px-4 py-2 text-[0.55rem] tracking-[0.14em] sm:left-7 sm:top-7"
          tone="smoke"
        >
          {tour.modalityLabel}
        </Badge>
        {tour.temporaryImage ? (
          <p className="absolute right-5 top-5 max-w-32 rounded-full bg-black/55 px-3 py-2 text-right text-[0.48rem] uppercase tracking-[0.13em] text-stone-300 backdrop-blur-sm sm:right-7 sm:top-7">
            Imagen provisional
          </p>
        ) : null}
        <p className="absolute bottom-6 left-6 font-[family-name:var(--font-manrope)] text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-white/80 sm:bottom-8 sm:left-8">
          San Carlos · Costa Rica
        </p>
      </div>

      <div
        className={`flex flex-col justify-between lg:col-span-5 lg:py-5 ${contentOrder}`}
      >
        <div>
          <div className="flex items-center justify-between gap-6">
            <p className="font-[family-name:var(--font-manrope)] text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#b9ff4a]">
              Experiencia {String(index + 1).padStart(2, "0")}
            </p>
            <p className="font-[family-name:var(--font-manrope)] text-5xl font-extrabold tracking-[-0.06em] text-white/[0.09]">
              {String(index + 1).padStart(2, "0")}
            </p>
          </div>

          <h3 className="mt-7 max-w-xl font-[family-name:var(--font-manrope)] text-[clamp(2rem,3.8vw,4rem)] font-extrabold leading-[0.96] tracking-[-0.045em] text-white">
            {tour.name}
          </h3>

          <p className="mt-6 flex items-start gap-3 text-sm leading-6 text-stone-300">
            <Icon className="mt-0.5 size-4 shrink-0 text-[#b9ff4a]" name="map" />
            {tour.location}
          </p>

          <p className="mt-5 font-[family-name:var(--font-manrope)] text-[0.62rem] font-semibold uppercase leading-5 tracking-[0.13em] text-white/65">
            {tour.modality}
          </p>

          <p className="mt-7 max-w-xl text-base font-light leading-8 text-stone-400">
            {tour.shortDescription}
          </p>
        </div>

        <div className="mt-9">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-y border-white/10 py-5">
            <div>
              <dt className="text-[0.52rem] font-semibold uppercase tracking-[0.16em] text-stone-600">
                Duración
              </dt>
              <dd className="mt-2 text-sm text-stone-300">{tour.duration}</dd>
            </div>
            <div>
              <dt className="text-[0.52rem] font-semibold uppercase tracking-[0.16em] text-stone-600">
                Dificultad
              </dt>
              <dd className="mt-2 text-sm text-stone-300">
                {tour.difficulty}
              </dd>
            </div>
          </dl>

          <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.52rem] font-semibold uppercase tracking-[0.16em] text-stone-600">
                Por persona
              </p>
              <p className="mt-2 font-[family-name:var(--font-manrope)] text-3xl font-extrabold tracking-[-0.04em] text-white">
                {formatCrc(tour.priceCrc)}
              </p>
            </div>
            <Link
              className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-white/20 px-6 font-[family-name:var(--font-manrope)] text-[0.58rem] font-bold uppercase tracking-[0.16em] text-white transition hover:border-[#b9ff4a] hover:bg-[#b9ff4a] hover:text-black"
              href={`/tours/${tour.slug}`}
            >
              Ver experiencia
              <Icon
                className="size-4 transition-transform duration-500 group-hover:translate-x-1"
                name="arrow"
              />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
