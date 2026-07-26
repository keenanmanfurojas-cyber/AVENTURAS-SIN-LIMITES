import { faqs } from "@/lib/home-content";

export function FaqAccordion() {
  return (
    <div className="space-y-3">
      {faqs.map((item, index) => (
        <details className="group rounded-[1.25rem] border border-white/10 bg-white/[0.035] shadow-[0_16px_50px_rgba(0,0,0,0.16)] backdrop-blur-md open:border-[#b9ff4a]/25 open:bg-[#b9ff4a]/[0.035]" key={item.question}>
          <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-left sm:gap-6 sm:px-7 [&::-webkit-details-marker]:hidden">
            <span className="flex items-start gap-4 sm:gap-6">
              <span className="pt-1 font-[family-name:var(--font-poppins)] text-[0.55rem] font-semibold tracking-widest text-[#b9ff4a]/60">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="font-[family-name:var(--font-poppins)] text-base font-semibold leading-6 text-stone-200 sm:text-xl">
                {item.question}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="relative size-5 shrink-0 text-[#b9ff4a]"
            >
              <span className="absolute left-0 top-1/2 h-px w-full bg-current" />
              <span className="absolute left-1/2 top-0 h-full w-px bg-current transition-transform group-open:rotate-90 group-open:opacity-0" />
            </span>
          </summary>
          <p className="max-w-3xl px-5 pb-6 font-[family-name:var(--font-poppins)] text-sm font-medium leading-7 text-stone-400 sm:px-16 sm:pb-7 sm:text-base sm:leading-8">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
