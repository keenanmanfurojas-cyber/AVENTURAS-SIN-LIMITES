import { TourCard } from "@/components/tours/tour-card";
import { tours } from "@/lib/tours-data";

export function FeaturedToursSection() {
  return (
    <section
      aria-labelledby="tours-heading"
      className="relative overflow-hidden bg-[#080a08] pb-24 pt-28 sm:pb-28 sm:pt-36 lg:pb-40 lg:pt-44"
      id="tours"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-obsidian via-obsidian/75 to-transparent"
      />
      <div className="relative mx-auto max-w-[90rem] px-6 sm:px-8 lg:px-12">
        <div
          className="grid gap-8 border-t border-white/20 pt-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-16"
          id="tours-heading"
        >
          <div>
            <p className="font-[family-name:var(--font-manrope)] text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#b9ff4a]">
              01 / Experiencias
            </p>
            <h2 className="mt-5 max-w-4xl font-[family-name:var(--font-manrope)] text-[clamp(2.75rem,6vw,6.5rem)] font-extrabold leading-[0.92] tracking-[-0.05em] text-white">
              Experiencias que dejan huella
            </h2>
          </div>
          <p className="max-w-2xl text-base font-light leading-8 text-stone-400 lg:justify-self-end lg:pb-2">
            Experiencias oficiales en San Carlos, disponibles con llegada
            directa o transporte grupal desde la GAM. Toda salida está sujeta
            al clima, la disponibilidad y la seguridad.
          </p>
        </div>

        <div className="mt-16 sm:mt-20 lg:mt-28">
          {tours.filter((tour) => tour.active).map((tour, index) => (
            <TourCard index={index} key={tour.slug} tour={tour} />
          ))}
        </div>
      </div>
    </section>
  );
}
