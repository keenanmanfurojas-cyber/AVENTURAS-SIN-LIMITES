import Image from "next/image";

import { NatureDecoration } from "@/components/effects/nature-decoration";
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
        alt="Cascada de agua celeste rodeada por bosque tropical"
        className="hero-primary-media object-cover object-center"
        fill
        priority
        quality={88}
        sizes="100vw"
        src={imageAssets.home.hero}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,6,5,0.76)_0%,rgba(5,6,5,0.38)_50%,rgba(5,6,5,0.12)_82%),linear-gradient(0deg,rgba(5,6,5,0.82)_0%,rgba(5,6,5,0.12)_58%,rgba(5,6,5,0.34)_100%)]" />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-obsidian via-obsidian/35 to-transparent"
      />
      <NatureDecoration
        className="absolute right-[5%] top-28 z-[2] hidden w-44 text-white/20 md:block xl:right-[8%] xl:w-52"
        variant="birds"
      />

      <Container className="relative z-10 flex min-h-[100svh] flex-col justify-end pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-28 sm:pb-14 sm:pt-32 lg:pb-16 lg:pt-40">
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
            className="motion-text-reveal text-balance mt-5 w-full max-w-[75rem] overflow-visible pb-[0.18em] font-[family-name:var(--font-manrope)] text-[clamp(2.75rem,13.5vw,8.2rem)] font-extrabold leading-[0.98] tracking-[-0.045em] text-white sm:mt-7 sm:leading-[0.94]"
            id="home-hero-title"
          >
            Aventuras que despie<span className="mr-[0.04em]">r</span>tan{" "}
            <span className="text-[#b9ff4a]">algo en ti.</span>
          </h1>

          <div className="mt-5 grid items-end gap-5 sm:mt-7 md:grid-cols-[minmax(0,34rem)_auto] md:justify-between md:gap-7 lg:mt-8">
            <p className="motion-fade-up max-w-xl font-[family-name:var(--font-poppins)] text-[clamp(0.94rem,3.9vw,1.125rem)] font-medium leading-[1.65] text-stone-100">
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

          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/25 px-4 py-4 shadow-[0_18px_55px_rgba(0,0,0,0.2)] backdrop-blur-md sm:mt-9 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:px-5">
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

          <a
            aria-label="Desliza hacia abajo para ver todas las experiencias"
            className="motion-fade-up group mx-auto mt-5 flex w-fit flex-col items-center gap-1.5 font-[family-name:var(--font-poppins)] text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-stone-300 transition-colors hover:text-[#b9ff4a] sm:mt-6"
            href="#tours"
          >
            <span>Desliza para descubrir más</span>
            <svg
              aria-hidden="true"
              className="hero-scroll-indicator size-5 text-[#b9ff4a]"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="m6 9 6 6 6-6"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </a>
        </div>
      </Container>
    </section>
  );
}
