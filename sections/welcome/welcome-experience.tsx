"use client";

import Image from "next/image";
import type { ReactNode } from "react";

import { ExploreButton } from "@/components/ui/explore-button";
import { useIntroExperience } from "@/hooks/use-intro-experience";
import { imageAssets } from "@/lib/image-assets";
import { siteConfig } from "@/lib/site-config";
import { PlatformEntry } from "@/sections/welcome/platform-entry";

type WelcomeExperienceProps = Readonly<{
  children: ReactNode;
}>;

export function WelcomeExperience({ children }: WelcomeExperienceProps) {
  const {
    destinationRef,
    hasMounted,
    phase,
    prefersReducedMotion,
  } = useIntroExperience();
  const isDeparting = phase === "departing";
  const hasEntered = phase === "entered";

  return (
    <>
      <noscript>
        <style>{`
          .cinematic-intro { display: none !important; }
          .platform-entry { opacity: 1 !important; transform: none !important; filter: none !important; }
        `}</style>
      </noscript>

      {!hasEntered ? (
        <section
          aria-label={`Bienvenida a ${siteConfig.name}`}
          className={`cinematic-intro intro--${phase} fixed inset-0 z-50 isolate h-[100dvh] w-screen overflow-hidden bg-volcanic ${
            isDeparting ? "pointer-events-none" : "pointer-events-auto"
          }`}
          data-reduced-motion={prefersReducedMotion}
        >
          <Image
            alt=""
            aria-hidden="true"
            className="intro-photo object-cover"
            fill
            priority
            quality={88}
            sizes="100vw"
            src={imageAssets.home.welcome}
          />
          <div aria-hidden="true" className="intro-photo-overlay" />

          <div className="relative flex min-h-[100dvh] flex-col items-center justify-center px-5 py-12 text-center sm:px-6">
            <div className="intro-brand-stage flex w-full flex-col items-center">
              <div className="intro-watermark-frame relative w-full">
                <Image
                  alt={`Identidad oficial de ${siteConfig.name}`}
                  className="intro-watermark-full h-auto max-w-none object-contain"
                  height={1350}
                  priority
                  sizes="(min-width: 640px) 480px, 76vw"
                  src={imageAssets.brand.watermark}
                  width={1080}
                />
              </div>

              <p className="intro-signature mt-8 font-[family-name:var(--font-cormorant-garamond)] text-[clamp(1.05rem,1.62vw,1.26rem)] font-semibold italic tracking-[0.16em] text-white/90 sm:tracking-[0.2em]">
                {siteConfig.brandLine}
              </p>

              <div className="intro-cta-stage mt-12 flex justify-center">
                <ExploreButton
                  ariaLabel="Saltar la introducción y explorar Aventuras Sin Límites"
                  href="/explorar"
                />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <PlatformEntry
        isHydrated={hasMounted}
        isRevealing={isDeparting}
        isVisible={hasEntered}
        sectionRef={destinationRef}
      >
        {children}
      </PlatformEntry>
    </>
  );
}
