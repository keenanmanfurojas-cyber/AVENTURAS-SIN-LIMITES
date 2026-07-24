import Link from "next/link";

import { OfficialLogo } from "@/components/brand/official-logo";
import { Container } from "@/components/layout/container";
import { navigationItems } from "@/lib/home-content";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#060505]">
      <Container className="py-16 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_1fr_0.9fr]">
          <div>
            <OfficialLogo
              className="mb-7 size-28 rounded-sm"
              sizes="112px"
            />
            <p className="font-display text-3xl text-stone-100">
              {siteConfig.name}
            </p>
            <p className="mt-3 text-[0.6rem] uppercase tracking-[0.3em] text-sand">
              {siteConfig.brandLine}
            </p>
            <p className="mt-5 max-w-xs text-sm font-light leading-7 text-stone-500">
              Experiencias de aventura creadas por{" "}
              {siteConfig.responsiblePerson} desde{" "}
              {siteConfig.contact.location}.
            </p>
          </div>

          <div>
            <p className="mb-5 text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-stone-500">
              Navegar
            </p>
            <ul className="grid grid-cols-2 gap-x-5 gap-y-3">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link
                    className="text-sm text-stone-400 transition-colors hover:text-sand"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-5 text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-stone-500">
              Contacto
            </p>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  className="text-stone-400 transition-colors hover:text-sand"
                  href={siteConfig.contact.whatsapp.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {siteConfig.contact.whatsapp.displayNumber}
                </a>
              </li>
              <li>
                <a
                  className="break-all text-stone-400 transition-colors hover:text-sand"
                  href={siteConfig.contact.email.href}
                >
                  {siteConfig.contact.email.address}
                </a>
              </li>
              <li className="text-stone-500">
                {siteConfig.contact.location}
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-5 text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-stone-500">
              Redes sociales
            </p>
            <p className="max-w-xs text-sm font-light leading-7 text-stone-500">
              Perfiles oficiales próximamente. Los enlaces se publicarán cuando
              estén confirmados.
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-7 text-[0.58rem] uppercase tracking-[0.2em] text-stone-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Derechos reservados.
          </p>
          <p>{siteConfig.contact.operationArea}</p>
        </div>
      </Container>
    </footer>
  );
}
