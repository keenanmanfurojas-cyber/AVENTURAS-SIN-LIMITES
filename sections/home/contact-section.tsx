import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/lib/site-config";

const contactChannels = [
  {
    icon: "message" as const,
    label: "WhatsApp",
    value: siteConfig.contact.whatsapp.displayNumber,
    href: siteConfig.contact.whatsapp.href,
    isExternal: true,
  },
  {
    icon: "mail" as const,
    label: "Correo",
    value: siteConfig.contact.email.address,
    href: siteConfig.contact.email.href,
    isExternal: false,
  },
  {
    icon: "map" as const,
    label: "Ubicación",
    value: siteConfig.contact.location,
    href: null,
    isExternal: false,
  },
];

export function ContactSection() {
  return (
    <section
      aria-labelledby="contact-heading"
      className="section-transition section-transition--canopy relative overflow-hidden bg-[#080a08] py-24 sm:py-28 lg:py-36"
      id="contacto"
    >
      <div className="absolute left-1/2 top-1/2 size-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b9ff4a]/[0.04] blur-3xl" />

      <div className="relative mx-auto max-w-[90rem] px-6 sm:px-8 lg:px-12" data-scroll-reveal-content>
        <div
          className="[&_.type-badge]:!font-[family-name:var(--font-manrope)] [&_.type-h2]:!font-[family-name:var(--font-manrope)] [&_.type-h2]:!font-extrabold"
          id="contact-heading"
        >
          <SectionHeading
            align="center"
            description="Las reservas en línea todavía no están activas, pero puedes escribirnos directamente por nuestros canales oficiales."
            eyebrow="Planeemos tu próxima aventura"
            title="El camino empieza con una conversación"
          />
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-3">
          {contactChannels.map((channel) => (
            <article
              className="rounded-[1.35rem] border border-[#b9ff4a]/10 bg-white/[0.04] p-7 text-center shadow-[0_20px_65px_rgba(0,0,0,0.2)] backdrop-blur-md sm:p-9"
              key={channel.label}
            >
              <Icon
                className="mx-auto mb-5 size-5 text-[#b9ff4a]"
                name={channel.icon}
              />
              <h3 className="font-[family-name:var(--font-poppins)] text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-stone-500">
                {channel.label}
              </h3>
              {channel.href ? (
                <a
                  className="mt-3 inline-block break-words font-[family-name:var(--font-poppins)] text-sm font-medium text-stone-300 underline decoration-[#b9ff4a]/25 underline-offset-4 transition-colors hover:text-[#b9ff4a]"
                  href={channel.href}
                  rel={channel.isExternal ? "noopener noreferrer" : undefined}
                  target={channel.isExternal ? "_blank" : undefined}
                >
                  {channel.value}
                </a>
              ) : (
                <p className="mt-3 font-[family-name:var(--font-poppins)] text-sm font-medium text-stone-300">{channel.value}</p>
              )}
            </article>
          ))}
        </div>

        <div className="mx-auto mt-9 flex max-w-2xl flex-col items-center text-center">
          <p className="font-[family-name:var(--font-poppins)] text-xs font-medium leading-6 text-stone-500">
            Operamos principalmente en{" "}
            {siteConfig.contact.operationArea}. Próximamente podrás consultar
            disponibilidad y reservar en línea; esta versión no procesa datos
            ni pagos.
          </p>
          <a
            className="mt-7 inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-[#b9ff4a] bg-[#b9ff4a] px-6 font-[family-name:var(--font-poppins)] text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-black shadow-[0_15px_45px_rgba(185,255,74,0.14)] transition-colors hover:border-[#d2ff91] hover:bg-[#d2ff91]"
            href={siteConfig.contact.whatsapp.href}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Icon className="size-4" name="message" />
            Escribir por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
