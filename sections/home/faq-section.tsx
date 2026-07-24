import { FaqAccordion } from "@/components/faq/faq-accordion";
import { SectionHeading } from "@/components/ui/section-heading";

export function FaqSection() {
  return (
    <section
      aria-labelledby="faq-heading"
      className="bg-obsidian py-24 sm:py-28 lg:py-36"
      id="preguntas"
    >
      <div className="mx-auto grid max-w-[90rem] gap-14 px-6 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20 lg:px-12">
        <div className="lg:sticky lg:top-32 lg:self-start" id="faq-heading">
          <SectionHeading
            description="Información inicial mientras preparamos las condiciones definitivas de cada experiencia."
            eyebrow="Antes de partir"
            title="Preguntas frecuentes"
          />
        </div>
        <FaqAccordion />
      </div>
    </section>
  );
}
