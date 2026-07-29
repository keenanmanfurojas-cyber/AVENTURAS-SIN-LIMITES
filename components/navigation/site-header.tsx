"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { BrandWatermark } from "@/components/brand/brand-watermark";
import { FogOverlay } from "@/components/effects/fog-overlay";
import { Container } from "@/components/layout/container";
import { Icon } from "@/components/ui/icon";
import { navigationItems } from "@/lib/home-content";
import { siteConfig } from "@/lib/site-config";

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback((restoreFocus = false) => {
    setIsMenuOpen(false);
    if (restoreFocus) {
      window.requestAnimationFrame(() => menuButtonRef.current?.focus());
    }
  }, []);

  useEffect(() => {
    let frameId = 0;

    const updateScrollState = () => {
      frameId = 0;
      setIsScrolled(window.scrollY > 32);
    };

    const handleScroll = () => {
      if (frameId === 0) {
        frameId = window.requestAnimationFrame(updateScrollState);
      }
    };

    updateScrollState();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const panel = menuPanelRef.current;
    const focusableElements = panel?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const firstFocusable = focusableElements?.[0];
    const lastFocusable = focusableElements?.[focusableElements.length - 1];

    window.requestAnimationFrame(() => firstFocusable?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
        return;
      }

      if (event.key !== "Tab" || !firstFocusable || !lastFocusable) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === lastFocusable
      ) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu, isMenuOpen]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[70] px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8 lg:px-12">
      <Container className="!px-0">
        <div
          className={`pointer-events-auto mx-auto flex items-center justify-between rounded-full border transition-[height,background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-refined ${
            isScrolled
              ? "h-14 border-white/14 bg-volcanic/88 px-4 shadow-glass backdrop-blur-xl sm:px-5"
              : "h-16 border-transparent bg-transparent px-1 shadow-none backdrop-blur-none sm:px-2"
          }`}
        >
          <Link
            aria-label={`${siteConfig.name} — Inicio`}
            className="group flex items-center rounded-full"
            href="/"
            onClick={() => closeMenu()}
          >
            <BrandWatermark
              className={`transition-[width,filter] duration-500 ${
                isScrolled ? "w-[6.25rem]" : "w-[7rem]"
              }`}
              priority
              sizes="112px"
            />
          </Link>

          <nav aria-label="Navegación principal" className="hidden xl:block">
            <ul className="flex items-center gap-9">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link
                    className="nav-link relative py-3 font-[family-name:var(--font-poppins)] text-[0.69rem] font-semibold uppercase tracking-[0.1em] text-white/85 transition-colors hover:text-[#c8ff70]"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              className="hidden min-h-10 items-center rounded-full border border-white/15 px-4 font-[family-name:var(--font-poppins)] text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-white/85 transition hover:border-[#b9ff4a]/40 hover:text-[#c8ff70] lg:inline-flex"
              href="/mi-reserva"
            >
              Mi reserva
            </Link>
            <a
              className="group hidden min-h-10 items-center gap-2 rounded-full border border-[#b9ff4a]/50 bg-[#b9ff4a] px-5 font-[family-name:var(--font-poppins)] text-[0.6rem] font-bold uppercase tracking-[0.16em] text-black shadow-[0_10px_32px_rgba(185,255,74,0.12)] transition duration-500 hover:-translate-y-0.5 hover:bg-[#cbff7a] active:translate-y-0 sm:inline-flex"
              href={siteConfig.contact.whatsapp.href}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Icon className="size-3.5" name="whatsapp" />
              Reservar
            </a>
            <button
              aria-controls="mobile-navigation"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
              className="relative grid size-11 place-items-center rounded-full border border-[#b9ff4a]/35 bg-[#b9ff4a]/10 text-smoke transition hover:border-[#b9ff4a]/70 hover:bg-[#b9ff4a]/15 xl:hidden"
              onClick={() => setIsMenuOpen((current) => !current)}
              ref={menuButtonRef}
              type="button"
            >
              <span
                className={`absolute h-px w-5 bg-current transition duration-300 ${
                  isMenuOpen ? "rotate-45" : "-translate-y-1.5"
                }`}
              />
              <span
                className={`absolute h-px w-5 bg-current transition duration-300 ${
                  isMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute h-px w-5 bg-current transition duration-300 ${
                  isMenuOpen ? "-rotate-45" : "translate-y-1.5"
                }`}
              />
            </button>
          </div>
        </div>
      </Container>

      <button
        aria-hidden={!isMenuOpen}
        aria-label="Cerrar menú"
        className={`pointer-events-auto fixed inset-0 -z-10 bg-black/70 backdrop-blur-sm transition-opacity duration-500 xl:hidden ${
          isMenuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        onClick={() => closeMenu(true)}
        tabIndex={isMenuOpen ? 0 : -1}
        type="button"
      />

      <div
        aria-hidden={!isMenuOpen}
        className={`glass-panel pointer-events-auto fixed inset-x-3 bottom-3 top-[calc(5.2rem+env(safe-area-inset-top))] z-[72] overflow-hidden rounded-[1.75rem] transition-[opacity,transform,visibility] duration-500 ease-refined sm:inset-x-5 xl:hidden ${
          isMenuOpen
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible translate-y-3 scale-[0.985] opacity-0"
        }`}
        id="mobile-navigation"
        inert={!isMenuOpen}
        ref={menuPanelRef}
      >
        <FogOverlay className="opacity-25" />
        <div className="relative flex h-full flex-col overflow-y-auto px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 sm:px-8">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
            <BrandWatermark
              className="w-[min(44vw,13rem)]"
              sizes="208px"
            />
            <p className="shrink-0 font-[family-name:var(--font-poppins)] text-right text-[0.46rem] font-semibold uppercase leading-4 tracking-[0.18em] text-[#b9ff4a]">
              {siteConfig.brandLine}
            </p>
          </div>

          <nav aria-label="Navegación móvil" className="mt-4">
            <ul className={isMenuOpen ? "motion-stagger" : ""}>
              {navigationItems.map((item, index) => (
                <li className="border-b border-white/10" key={item.href}>
                  <Link
                    className="group flex min-h-14 items-center justify-between py-3 font-[family-name:var(--font-poppins)] text-[clamp(1.3rem,6vw,1.85rem)] font-medium leading-tight tracking-[-0.025em] text-stone-200 transition-colors hover:text-[#b9ff4a]"
                    href={item.href}
                    onClick={() => closeMenu()}
                  >
                    {item.label}
                    <span className="font-[family-name:var(--font-poppins)] text-[0.5rem] tracking-widest text-stone-400 transition-colors group-hover:text-[#b9ff4a]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto grid gap-3 pt-6 sm:grid-cols-2">
            <Link
              className="flex min-h-12 items-center justify-center gap-3 rounded-full border border-[#b9ff4a]/25 bg-[#b9ff4a]/[0.06] px-5 font-[family-name:var(--font-poppins)] text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[#cbff7a] sm:col-span-2"
              href="/mi-reserva"
              onClick={() => closeMenu()}
            >
              Consultar mi reserva
            </Link>
            <a
              className="flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#b9ff4a] px-5 font-[family-name:var(--font-poppins)] text-[0.58rem] font-bold uppercase tracking-[0.2em] text-black shadow-[0_12px_36px_rgba(185,255,74,0.16)] transition-colors hover:bg-[#cbff7a]"
              href={siteConfig.contact.whatsapp.href}
              onClick={() => closeMenu()}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Icon className="size-4" name="whatsapp" />
              Reservar por WhatsApp
            </a>
            <a
              className="flex min-h-12 items-center justify-center gap-3 rounded-full border border-white/15 bg-white/[0.035] px-5 font-[family-name:var(--font-poppins)] text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-ash"
              href={siteConfig.contact.email.href}
              onClick={() => closeMenu()}
            >
              <Icon className="size-4" name="mail" />
              Correo
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
