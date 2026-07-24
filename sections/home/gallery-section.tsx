import Image from "next/image";

import { SectionHeading } from "@/components/ui/section-heading";
import { galleryImages } from "@/lib/home-content";

export function GallerySection() {
  return (
    <section
      aria-labelledby="gallery-heading"
      className="bg-obsidian py-24 sm:py-28 lg:py-36"
      id="galeria"
    >
      <div className="mx-auto max-w-[90rem] px-6 sm:px-8 lg:px-12">
        <div id="gallery-heading">
          <SectionHeading
            align="center"
            description="Imágenes temporales que marcan la dirección visual. Este espacio está preparado para recibir la fotografía real de cada aventura."
            eyebrow="Fragmentos de Costa Rica"
            title="La naturaleza cuenta la historia"
          />
        </div>

        <div className="mt-14 grid auto-rows-[15rem] gap-3 sm:auto-rows-[18rem] md:grid-cols-3 md:auto-rows-[15rem] lg:auto-rows-[18rem]">
          {galleryImages.map((image) => (
            <figure
              className={`group relative overflow-hidden ${image.className}`}
              key={`${image.src}-${image.caption}`}
            >
              <Image
                alt={image.alt}
                className="object-cover transition duration-1000 group-hover:scale-105"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                src={image.src}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-80" />
              <figcaption className="absolute inset-x-0 bottom-0 p-5 text-[0.58rem] font-semibold uppercase tracking-[0.25em] text-stone-200">
                {image.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
