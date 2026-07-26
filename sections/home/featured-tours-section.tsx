import { NatureDecoration } from "@/components/effects/nature-decoration";
import { TourCard } from "@/components/tours/tour-card";
import { tours } from "@/lib/tours-data";

const canonicalTourSlugs = [
  "canon-ciudad-esmeralda-sin-transporte",
  "amanecer-volcan-platanar-sin-transporte",
  "entre-volcanes-guatemala",
];

export function FeaturedToursSection() {
  const featuredTours = canonicalTourSlugs
    .map((slug) => tours.find((tour) => tour.slug === slug))
    .filter((tour) => tour?.active);

  return (
    <section
      aria-labelledby="tours-heading"
      className="section-transition section-transition--mist relative overflow-hidden bg-[#080a08] pb-24 pt-12 sm:pb-28 sm:pt-16 lg:pb-36 lg:pt-20"
      id="experiencias"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-obsidian via-obsidian/75 to-transparent"
      />
      <div className="relative mx-auto max-w-[90rem] px-6 sm:px-8 lg:px-12" data-scroll-reveal-content>
        <div
          className="experiences-intro relative grid gap-7 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,0.78fr)] lg:items-center lg:gap-12 xl:gap-16"
          id="tours-heading"
        >
          <div className="relative z-10 -translate-y-9">
            <p className="font-[family-name:var(--font-manrope)] text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-[#b9ff4a]">
              01 / Experiencias
            </p>
            <h2 className="mt-4 max-w-4xl font-[family-name:var(--font-manrope)] text-[clamp(2.35rem,10.5vw,6.25rem)] font-extrabold leading-[0.94] tracking-[-0.045em] text-white sm:mt-5 sm:leading-[0.92]">
              Experiencias que{" "}
              <span className="experiences-title-accent relative top-7 inline-block text-[#b9ff4a]">
                dejan huella
                <svg
                  aria-hidden="true"
                  className="ml-3 inline-block h-[0.74em] w-[1.05em] overflow-visible align-baseline text-[#b9ff4a]"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 54 36"
                >
                  <g strokeWidth="2" transform="rotate(-16 14 18)">
                    <path d="M10 2.5c4-1.2 8 .8 9.2 4.8l1.2 4.1c.8 2.8.2 5.8-1.7 8l-1.2 1.4.8 6.6c.4 3.1-1.9 5.9-5 6.1-3 .2-5.5-2.1-5.5-5.1l.1-7-1.5-1.6a8.6 8.6 0 0 1-2-8.1l1.1-4.2A7 7 0 0 1 10 2.5Z" />
                    <path d="m6.4 10.2 12.7 3.4M6.2 15l12.3 3.3M8 22h9.3M8 27h9.8M10.5 4.2l1.2 4.5m4-4.3-.9 4.7" />
                  </g>
                  <g strokeWidth="2" transform="translate(27 1) rotate(15 14 18)">
                    <path d="M10 2.5c4-1.2 8 .8 9.2 4.8l1.2 4.1c.8 2.8.2 5.8-1.7 8l-1.2 1.4.8 6.6c.4 3.1-1.9 5.9-5 6.1-3 .2-5.5-2.1-5.5-5.1l.1-7-1.5-1.6a8.6 8.6 0 0 1-2-8.1l1.1-4.2A7 7 0 0 1 10 2.5Z" />
                    <path d="m6.4 10.2 12.7 3.4M6.2 15l12.3 3.3M8 22h9.3M8 27h9.8M10.5 4.2l1.2 4.5m4-4.3-.9 4.7" />
                  </g>
                </svg>
              </span>
            </h2>
          </div>
          <svg
            aria-hidden="true"
            className="experiences-callout-arrow pointer-events-none absolute right-[15%] top-[-1.5rem] hidden h-28 w-44 overflow-visible text-[#b9ff4a]/35 lg:block"
            fill="none"
            viewBox="0 0 176 112"
          >
            <path
              className="experiences-callout-arrow-line"
              d="M8 18c38-11 74-2 101 18 24 18 35 38 45 58"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="1.5"
            />
            <path
              className="experiences-callout-arrow-head"
              d="m137 84 17 10 4-19"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
          <p className="experiences-callout relative z-10 isolate max-w-2xl px-9 py-7 font-[family-name:var(--font-poppins)] text-xs font-medium leading-6 text-stone-300 before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rotate-[-2deg] before:rounded-[58%_42%_61%_39%/46%_57%_43%_54%] before:border before:border-[#b9ff4a]/20 before:content-[''] after:pointer-events-none after:absolute after:inset-1 after:-z-10 after:rotate-[2deg] after:rounded-[43%_57%_39%_61%/59%_44%_56%_41%] after:border after:border-[#b9ff4a]/[0.07] after:content-[''] sm:px-12 sm:py-9 sm:text-sm sm:leading-7 lg:justify-self-end">
            Experiencias oficiales en San Carlos, disponibles con llegada
            directa o transporte grupal desde la GAM. Toda salida está sujeta
            al clima, la disponibilidad y la seguridad.
          </p>
        </div>

        <div
          className="mt-12 grid scroll-mt-24 gap-6 sm:mt-16 md:grid-cols-2 lg:mt-24 xl:grid-cols-3"
          id="tours"
        >
          {featuredTours.map((tour, index) =>
            tour ? <TourCard index={index} key={tour.slug} tour={tour} /> : null,
          )}
        </div>
      </div>
      <NatureDecoration
        className="absolute inset-x-0 bottom-0 h-28 w-full text-[#b9ff4a]/10 sm:h-36"
        variant="roots"
      />
    </section>
  );
}
