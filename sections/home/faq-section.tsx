import { FaqAccordion } from "@/components/faq/faq-accordion";
import { NatureDecoration } from "@/components/effects/nature-decoration";
import { SectionHeading } from "@/components/ui/section-heading";

export function FaqSection() {
  return (
    <section
      aria-labelledby="faq-heading"
      className="section-transition section-transition--mist relative overflow-hidden bg-[#080a08] py-24 sm:py-28 lg:py-36"
      id="preguntas"
    >
      <NatureDecoration
        className="absolute right-[2%] top-40 hidden h-72 w-28 rotate-6 text-[#b9ff4a]/10 xl:block"
        variant="footprints"
      />
      <div
        className="relative mx-auto max-w-[90rem] px-6 sm:px-8 lg:px-12"
        data-scroll-reveal-content
      >
        <div
          className="[&_.type-badge]:!font-[family-name:var(--font-manrope)] [&_.type-h2]:!font-[family-name:var(--font-manrope)] [&_.type-h2]:!font-extrabold [&_.type-h2~p]:!font-[family-name:var(--font-manrope)]"
          id="faq-heading"
        >
          <SectionHeading
            align="center"
            description="Información inicial mientras preparamos las condiciones definitivas de cada experiencia."
            eyebrow="Antes de partir"
            title="Preguntas frecuentes"
          />
        </div>
        <div className="mx-auto mt-14 max-w-6xl">
          <FaqAccordion />
        </div>
      </div>
    </section>
  );
}
