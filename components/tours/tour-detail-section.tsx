import type { ReactNode } from "react";

import { InViewReveal } from "@/components/ui/in-view-reveal";

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
    <InViewReveal>
      <section className="rounded-[1.5rem] border border-[#b9ff4a]/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] p-6 shadow-[0_20px_65px_rgba(0,0,0,0.16)] backdrop-blur-md sm:p-8">
        {eyebrow ? (
          <p className="mb-3 font-[family-name:var(--font-poppins)] text-[0.55rem] font-semibold uppercase tracking-[0.25em] text-[#b9ff4a]">
            {eyebrow}
          </p>
        ) : null}
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="h-px w-8 bg-gradient-to-r from-[#b9ff4a] to-[#b9ff4a]/10"
          />
          <h2 className="font-[family-name:var(--font-manrope)] text-3xl font-extrabold tracking-[-0.035em] text-stone-100 sm:text-4xl">
            {title}
          </h2>
        </div>
        <div className="mt-6 font-[family-name:var(--font-poppins)] text-sm font-medium leading-7 text-stone-400 sm:text-base sm:leading-8">
          {children}
        </div>
      </section>
    </InViewReveal>
  );
}
