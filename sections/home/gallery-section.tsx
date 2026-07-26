import Image from "next/image";

import { NatureDecoration } from "@/components/effects/nature-decoration";
import { SectionHeading } from "@/components/ui/section-heading";
import { galleryImages } from "@/lib/home-content";

export function GallerySection() {
  return (
    <section
      aria-labelledby="gallery-heading"
      className="section-transition section-transition--mist relative overflow-hidden bg-[#080a08] py-24 sm:py-28 lg:py-36"
      id="galeria"
    >
      <NatureDecoration
        className="absolute -bottom-10 -left-8 z-[1] w-36 text-[#b9ff4a]/10 sm:w-44 lg:w-52"
        variant="foliage"
      />
      <NatureDecoration
        className="absolute -right-10 top-24 z-[1] hidden w-44 -scale-x-100 text-[#b9ff4a]/[0.07] lg:block"
        variant="foliage"
      />
      <div className="mx-auto max-w-[90rem] px-6 sm:px-8 lg:px-12" data-scroll-reveal-content>
        <div
          className="[&_.type-badge]:!font-[family-name:var(--font-manrope)] [&_.type-h2]:!font-[family-name:var(--font-manrope)] [&_.type-h2]:!font-extrabold"
          id="gallery-heading"
        >
          <SectionHeading
            align="center"
            description="Imágenes que marcan la esencia de cada experiencia. Este espacio crecerá con las fotografías reales de cada aventura."
            eyebrow="Fragmentos de aventura"
            title="Cada destino cuenta una historia"
          />
        </div>

        <div className="mt-14 grid auto-rows-[15rem] gap-4 sm:auto-rows-[18rem] md:grid-cols-3 md:auto-rows-[15rem] lg:auto-rows-[18rem]">
          {galleryImages.map((image) => (
            <figure
              className={`group relative overflow-hidden rounded-[1.4rem] border border-white/10 bg-white/[0.03] shadow-[0_20px_65px_rgba(0,0,0,0.24)] ${image.className}`}
              key={`${image.src}-${image.caption}`}
            >
              <Image
                alt={image.alt}
                className="object-cover transition duration-1000 group-hover:scale-105"
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                src={image.src}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-80" />
              <figcaption className="absolute inset-x-0 bottom-0 p-5 font-[family-name:var(--font-poppins)] text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[#d8ff9d]">
                {image.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
