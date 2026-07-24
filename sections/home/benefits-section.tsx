import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-heading";
import { benefits } from "@/lib/home-content";

export function BenefitsSection() {
  return (
    <section
      aria-labelledby="benefits-heading"
      className="border-y border-white/10 bg-charcoal py-24 sm:py-28 lg:py-32"
      id="experiencias"
    >
      <div className="mx-auto max-w-[90rem] px-6 sm:px-8 lg:px-12">
        <div className="grid gap-14 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start" id="benefits-heading">
            <SectionHeading
              description="Cada detalle importa: desde cómo elegimos una ruta hasta la forma en que acompañamos a cada persona."
              eyebrow="Nuestra forma de viajar"
              title="Por qué viajar con nosotros"
            />
          </div>

          <div className="grid sm:grid-cols-2">
            {benefits.map((benefit, index) => (
              <article
                className={`border-white/10 py-8 sm:p-8 ${
                  index % 2 === 0 ? "sm:border-r" : ""
                } ${index < benefits.length - 2 ? "border-b" : ""}`}
                key={benefit.title}
              >
                <div className="mb-6 grid size-11 place-items-center border border-sand/25 text-sand">
                  <Icon className="size-5" name={benefit.icon} />
                </div>
                <h3 className="font-display text-2xl text-stone-100">
                  {benefit.title}
                </h3>
                <p className="mt-3 text-sm font-light leading-7 text-stone-500">
                  {benefit.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
