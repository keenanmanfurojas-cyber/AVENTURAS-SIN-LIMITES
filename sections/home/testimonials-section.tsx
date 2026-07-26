import { SectionHeading } from "@/components/ui/section-heading";
import { testimonials } from "@/lib/home-content";
import type { Testimonial } from "@/types/content";

type TestimonialCardProps = Readonly<{
  testimonial: Testimonial;
}>;

function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <figure className="flex min-h-80 w-[min(26.25rem,calc(100vw-3rem))] shrink-0 flex-col rounded-[1.4rem] border border-[#b9ff4a]/10 bg-white/[0.035] p-7 shadow-[0_22px_70px_rgba(0,0,0,0.22)] backdrop-blur-md sm:p-8">
      <span
        aria-hidden="true"
        className="font-[family-name:var(--font-manrope)] text-5xl font-extrabold leading-none text-[#b9ff4a]/55"
      >
        “
      </span>
      <blockquote className="mt-4 flex-1 font-[family-name:var(--font-manrope)] text-2xl font-semibold leading-9 text-stone-200">
        {testimonial.quote}
      </blockquote>
      <div className="mt-7 flex items-center justify-between gap-4 font-[family-name:var(--font-poppins)]">
        <div
          aria-label={`${testimonial.rating} de 5 estrellas`}
          className="flex gap-1 text-[#b9ff4a]"
        >
          {Array.from({ length: testimonial.rating }, (_, index) => (
            <span aria-hidden="true" key={index}>
              ★
            </span>
          ))}
        </div>
        <p className="text-xs font-bold text-[#b9ff4a]">
          {testimonial.satisfaction}% satisfacción
        </p>
      </div>
      <figcaption className="mt-8 rounded-xl bg-black/20 p-4">
        <p className="font-[family-name:var(--font-poppins)] text-xs font-semibold uppercase tracking-[0.16em] text-stone-300">
          {testimonial.author}
        </p>
        <p className="mt-2 font-[family-name:var(--font-poppins)] text-[0.58rem] leading-5 text-stone-500">
          {testimonial.context}
        </p>
      </figcaption>
    </figure>
  );
}

export function TestimonialsSection() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="section-transition section-transition--canopy relative overflow-hidden bg-[#080a08] py-24 sm:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-[90rem] px-6 sm:px-8 lg:px-12" data-scroll-reveal-content>
        <div
          className="[&_.type-badge]:!font-[family-name:var(--font-manrope)] [&_.type-h2]:!font-[family-name:var(--font-manrope)] [&_.type-h2]:!font-extrabold"
          id="testimonials-heading"
        >
          <SectionHeading
            align="center"
            eyebrow="Voces del camino"
            title="Historias que cuentan nuestros viajeros"
          />
        </div>

        <div className="mx-auto mt-12 max-w-5xl rounded-full border border-[#b9ff4a]/15 bg-[#b9ff4a]/[0.035] px-5 py-4 text-center font-[family-name:var(--font-poppins)] text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-[#d8ff9d]/70">
          Historias ilustrativas de la experiencia que buscamos crear
        </div>

        <div
          aria-label="Carrusel continuo de testimonios demostrativos"
          className="testimonials-marquee relative mt-8"
          role="region"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-20 w-14 bg-gradient-to-r from-[#080a08] to-transparent sm:w-24"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-20 w-14 bg-gradient-to-l from-[#080a08] to-transparent sm:w-24"
          />
          <div className="testimonials-marquee-track">
            <div className="testimonials-marquee-group">
              {testimonials.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.author}
                  testimonial={testimonial}
                />
              ))}
            </div>
            <div aria-hidden="true" className="testimonials-marquee-group">
              {testimonials.map((testimonial) => (
                <TestimonialCard
                  key={`duplicate-${testimonial.author}`}
                  testimonial={testimonial}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
