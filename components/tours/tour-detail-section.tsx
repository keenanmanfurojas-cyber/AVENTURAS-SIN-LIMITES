import type { ReactNode } from "react";

type TourDetailSectionProps = Readonly<{
  children: ReactNode;
  eyebrow?: string;
  title: string;
}>;

export function TourDetailSection({
  children,
  eyebrow,
  title,
}: TourDetailSectionProps) {
  return (
    <section className="border-t border-white/10 py-9 sm:py-11">
      {eyebrow ? (
        <p className="mb-3 text-[0.52rem] font-semibold uppercase tracking-[0.25em] text-moss">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-3xl text-stone-100 sm:text-4xl">
        {title}
      </h2>
      <div className="mt-6 text-sm font-light leading-7 text-stone-400 sm:text-base sm:leading-8">
        {children}
      </div>
    </section>
  );
}
