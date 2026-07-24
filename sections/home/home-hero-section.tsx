import Image from "next/image";

import { Container } from "@/components/layout/container";
import { ActionLink } from "@/components/ui/action-link";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { imageAssets } from "@/lib/image-assets";
import { siteConfig } from "@/lib/site-config";

const trustSignals = [
  { icon: "guide" as const, label: "Guías locales" },
  { icon: "shield" as const, label: "Seguridad primero" },
  { icon: "pin" as const, label: "San Carlos, Costa Rica" },
];

export function HomeHeroSection() {
  return (
    <section
      aria-labelledby="home-hero-title"
      className="hero-cinematic relative isolate min-h-[100svh] overflow-hidden bg-volcanic"
      id="inicio"
    >
      <Image
        alt="Volcán entre bosque tropical y nubes al atardecer"
        className="hero-primary-media object-cover object-center"
        fill
        priority
        quality={88}
        sizes="100vw"
        src={imageAssets.home.welcome}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,6,5,0.72)_0%,rgba(5,6,5,0.35)_48%,rgba(5,6,5,0.08)_78%),linear-gradient(0deg,rgba(5,6,5,0.78)_0%,transparent_48%,rgba(5,6,5,0.28)_100%)]" />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-obsidian via-obsidian/35 to-transparent"
      />

      <Container className="relative z-10 flex min-h-[100svh] flex-col justify-end pb-12 pt-32 sm:pb-14 lg:pb-16 lg:pt-40">
        <div className="w-full">
          <div className="motion-fade-up">
            <Badge
              className="rounded-full border-[#b9ff4a]/45 bg-black/25 px-5 py-2 font-[family-name:var(--font-poppins)] text-[0.62rem] tracking-[0.14em] text-[#c8ff70]"
              tone="neutral"
            >
              Experiencias de aventura en Costa Rica
            </Badge>
          </div>

          <h1
            className="motion-text-reveal text-balance mt-7 w-full max-w-[75rem] overflow-visible pb-[0.12em] font-[family-name:var(--font-manrope)] text-[clamp(3.25rem,7.1vw,8.2rem)] font-extrabold leading-[0.94] tracking-[-0.045em] text-white"
            id="home-hero-title"
          >
            Aventuras que despiertan{" "}
            <span className="text-[#b9ff4a]">algo en ti.</span>
          </h1>

          <div className="mt-8 grid items-end gap-7 md:grid-cols-[minmax(0,34rem)_auto] md:justify-between lg:mt-10">
            <p className="motion-fade-up max-w-xl text-base font-light leading-7 text-stone-200 sm:text-lg sm:leading-8">
              Explora cañones, volcanes y paisajes extraordinarios junto a
              guías locales.
            </p>

            <div className="motion-fade-up flex flex-col gap-3 sm:flex-row md:justify-end">
              <ActionLink
                className="min-h-[3.25rem] !border-[#b9ff4a] !bg-[#b9ff4a] px-7 font-[family-name:var(--font-poppins)] text-[0.7rem] font-semibold tracking-[0.14em] !text-black !shadow-[0_12px_40px_rgba(185,255,74,0.16)] hover:!bg-[#cbff7a]"
                href="#tours"
              >
                Explorar experiencias
              </ActionLink>
              <ActionLink
                className="min-h-[3.25rem] px-7 font-[family-name:var(--font-poppins)] text-[0.7rem] font-semibold tracking-[0.14em]"
                external
                href={siteConfig.contact.whatsapp.href}
                icon="whatsapp"
                variant="secondary"
              >
                Reservar por WhatsApp
              </ActionLink>
            </div>
          </div>

          <div className="mt-9 flex flex-col gap-5 border-t border-white/15 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <ul
              aria-label="Características de las experiencias"
              className="flex flex-wrap gap-x-7 gap-y-3"
            >
              {trustSignals.map((signal) => (
                <li
                  className="flex items-center gap-2 font-[family-name:var(--font-poppins)] text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-stone-200"
                  key={signal.label}
                >
                  <Icon className="size-4 text-[#b9ff4a]" name={signal.icon} />
                  {signal.label}
                </li>
              ))}
            </ul>
            <p className="font-[family-name:var(--font-poppins)] text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-stone-300">
              {siteConfig.brandLine}
            </p>
          </div>
        </div>
      </Container>

      <a
        aria-label="Desplazarse a las experiencias"
        className="absolute bottom-5 right-8 z-20 hidden items-center gap-3 text-[0.52rem] font-semibold uppercase tracking-[0.24em] text-stone-300 transition-colors hover:text-[#b9ff4a] xl:flex"
        href="#tours"
      >
        Descubrir
        <span className="h-px w-12 bg-gradient-to-r from-white/60 to-transparent" />
      </a>
    </section>
  );
}
