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
      className="relative overflow-hidden border-t border-white/10 bg-[#110d0e] py-24 sm:py-28 lg:py-36"
      id="contacto"
    >
      <div className="surface-grid absolute inset-0 opacity-60" />
      <div className="absolute left-1/2 top-0 size-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-forest/40 blur-3xl" />

      <div className="relative mx-auto max-w-[90rem] px-6 sm:px-8 lg:px-12">
        <div id="contact-heading">
          <SectionHeading
            align="center"
            description="Las reservas en línea todavía no están activas, pero puedes escribirnos directamente por nuestros canales oficiales."
            eyebrow="Planeemos tu próxima aventura"
            title="El camino empieza con una conversación"
          />
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
          {contactChannels.map((channel) => (
            <article
              className="bg-charcoal p-7 text-center sm:p-9"
              key={channel.label}
            >
              <Icon
                className="mx-auto mb-5 size-5 text-sand"
                name={channel.icon}
              />
              <h3 className="text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-stone-500">
                {channel.label}
              </h3>
              {channel.href ? (
                <a
                  className="mt-3 inline-block text-sm text-stone-300 underline decoration-white/20 underline-offset-4 transition-colors hover:text-sand"
                  href={channel.href}
                  rel={channel.isExternal ? "noopener noreferrer" : undefined}
                  target={channel.isExternal ? "_blank" : undefined}
                >
                  {channel.value}
                </a>
              ) : (
                <p className="mt-3 text-sm text-stone-300">{channel.value}</p>
              )}
            </article>
          ))}
        </div>

        <div className="mx-auto mt-9 flex max-w-2xl flex-col items-center text-center">
          <p className="text-xs font-light leading-6 text-stone-500">
            Operamos principalmente en{" "}
            {siteConfig.contact.operationArea}. Próximamente podrás consultar
            disponibilidad y reservar en línea; esta versión no procesa datos
            ni pagos.
          </p>
          <a
            className="mt-7 inline-flex min-h-12 items-center justify-center gap-3 border border-sand bg-sand px-6 text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-obsidian transition-colors hover:border-stone-100 hover:bg-stone-100"
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
