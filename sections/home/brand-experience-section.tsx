import Image from "next/image";

import { FogOverlay } from "@/components/effects/fog-overlay";
import { ActionLink } from "@/components/ui/action-link";
import { imageAssets } from "@/lib/image-assets";

export function BrandExperienceSection() {
  return (
    <section
      aria-labelledby="brand-experience-heading"
      className="relative isolate min-h-[80svh] overflow-hidden"
      id="nosotros"
    >
      <Image
        alt="Volcán Arenal y selva tropical envueltos por nubes"
        className="object-cover"
        fill
        sizes="100vw"
        src={imageAssets.home.welcome}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,6,6,0.94)_0%,rgba(7,6,6,0.76)_48%,rgba(7,6,6,0.3)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-obsidian/30" />
      <FogOverlay className="opacity-35" />

      <div className="relative mx-auto flex min-h-[80svh] max-w-[90rem] items-center px-6 py-24 sm:px-8 lg:px-12">
        <div className="max-w-3xl">
          <p className="mb-6 text-[0.58rem] font-semibold uppercase tracking-[0.36em] text-moss">
            Más que un destino
          </p>
          <h2
            className="text-balance font-display text-4xl leading-[1.02] text-white sm:text-6xl lg:text-7xl"
            id="brand-experience-heading"
          >
            No vendemos únicamente tours.
            <span className="mt-2 block italic text-sand">
              Creamos recuerdos que respiran.
            </span>
          </h2>
          <p className="mt-8 max-w-2xl text-base font-light leading-8 text-stone-300">
            Creemos en la pausa frente a una montaña, en el sonido del bosque
            después de la lluvia y en la conversación que nace durante el
            camino. Diseñamos experiencias para volver a sentir, conectar y
            recordar.
          </p>
          <ActionLink className="mt-9" href="#contacto" variant="secondary">
            Conversemos
          </ActionLink>
        </div>
      </div>
    </section>
  );
}
