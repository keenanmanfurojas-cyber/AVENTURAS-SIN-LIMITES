import { SectionHeading } from "@/components/ui/section-heading";
import { testimonials } from "@/lib/home-content";

export function TestimonialsSection() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="border-y border-white/10 bg-charcoal py-24 sm:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-[90rem] px-6 sm:px-8 lg:px-12">
        <div id="testimonials-heading">
          <SectionHeading
            align="center"
            eyebrow="Voces del camino"
            title="Historias que algún día contarán nuestros viajeros"
          />
        </div>

        <div className="mx-auto mt-12 max-w-5xl border border-amber-200/15 bg-amber-100/[0.03] px-5 py-4 text-center text-[0.58rem] uppercase tracking-[0.2em] text-amber-100/60">
          Contenido demostrativo — no corresponde a opiniones verificadas
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure
              className="flex min-h-72 flex-col border border-white/10 bg-obsidian p-7 sm:p-8"
              key={testimonial.quote}
            >
              <span
                aria-hidden="true"
                className="font-display text-5xl leading-none text-sand/45"
              >
                “
              </span>
              <blockquote className="mt-4 flex-1 font-display text-2xl leading-9 text-stone-200">
                {testimonial.quote}
              </blockquote>
              <figcaption className="mt-8 border-t border-white/10 pt-5">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-300">
                  {testimonial.author}
                </p>
                <p className="mt-2 text-[0.58rem] leading-5 text-stone-600">
                  {testimonial.context}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
