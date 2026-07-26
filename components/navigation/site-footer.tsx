import Link from "next/link";

import { OfficialLogo } from "@/components/brand/official-logo";
import { Container } from "@/components/layout/container";
import { navigationItems } from "@/lib/home-content";
import { siteConfig } from "@/lib/site-config";

const copyrightYear = 2026;

export function SiteFooter() {
  return (
    <footer
      className="relative scroll-mt-20 overflow-hidden bg-[#080a08]"
      id="nosotros"
    >
      <Container className="scroll-reveal-content py-16 lg:py-20">
        <div className="relative grid gap-12 md:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_1fr_0.9fr]">
          <div>
            <OfficialLogo
              className="mb-7 size-28 rounded-sm"
              sizes="112px"
            />
            <p className="font-[family-name:var(--font-manrope)] text-3xl font-extrabold tracking-[-0.035em] text-stone-100">
              {siteConfig.name}
            </p>
            <p className="mt-3 font-[family-name:var(--font-poppins)] text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-[#b9ff4a]">
              {siteConfig.brandLine}
            </p>
            <p className="mt-5 max-w-xs font-[family-name:var(--font-poppins)] text-sm font-medium leading-7 text-stone-500">
              Experiencias de aventura creadas por{" "}
              {siteConfig.responsiblePerson} desde{" "}
              {siteConfig.contact.location}.
            </p>
          </div>

          <div>
            <p className="mb-5 font-[family-name:var(--font-manrope)] text-[0.62rem] font-bold uppercase tracking-[0.24em] text-stone-500">
              Navegar
            </p>
            <ul className="grid grid-cols-2 gap-x-5 gap-y-3">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link
                    className="font-[family-name:var(--font-poppins)] text-sm font-medium leading-6 text-stone-400 transition-colors hover:text-[#b9ff4a]"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-5 font-[family-name:var(--font-manrope)] text-[0.62rem] font-bold uppercase tracking-[0.24em] text-stone-500">
              Contacto
            </p>
            <ul className="space-y-3 font-[family-name:var(--font-poppins)] text-sm font-medium leading-6">
              <li>
                <a
                  className="text-stone-400 transition-colors hover:text-[#b9ff4a]"
                  href={siteConfig.contact.whatsapp.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {siteConfig.contact.whatsapp.displayNumber}
                </a>
              </li>
              <li>
                <a
                  className="break-all text-stone-400 transition-colors hover:text-[#b9ff4a]"
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
            <p className="mb-5 font-[family-name:var(--font-manrope)] text-[0.62rem] font-bold uppercase tracking-[0.24em] text-stone-500">
              Redes sociales
            </p>
            <p className="max-w-xs font-[family-name:var(--font-poppins)] text-sm font-medium leading-7 text-stone-500">
              Perfiles oficiales próximamente. Los enlaces se publicarán cuando
              estén confirmados.
            </p>
          </div>
        </div>

        <div className="relative mt-14 flex flex-col gap-3 rounded-2xl bg-white/[0.025] px-5 py-5 font-[family-name:var(--font-poppins)] text-[0.58rem] uppercase tracking-[0.16em] text-stone-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {copyrightYear} {siteConfig.name}. Derechos reservados.
          </p>
          <p>{siteConfig.contact.operationArea}</p>
        </div>
      </Container>
    </footer>
  );
}
