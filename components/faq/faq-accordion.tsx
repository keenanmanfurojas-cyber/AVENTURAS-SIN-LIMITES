import { faqs } from "@/lib/home-content";

export function FaqAccordion() {
  return (
    <div className="border-t border-white/15">
      {faqs.map((item, index) => (
        <details className="group border-b border-white/15" key={item.question}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left [&::-webkit-details-marker]:hidden">
            <span className="flex items-start gap-4 sm:gap-6">
              <span className="pt-1 text-[0.55rem] tracking-widest text-stone-600">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-xl text-stone-200 sm:text-2xl">
                {item.question}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="relative size-5 shrink-0 text-sand"
            >
              <span className="absolute left-0 top-1/2 h-px w-full bg-current" />
              <span className="absolute left-1/2 top-0 h-full w-px bg-current transition-transform group-open:rotate-90 group-open:opacity-0" />
            </span>
          </summary>
          <p className="max-w-3xl pb-7 pl-10 pr-8 text-sm font-light leading-7 text-stone-400 sm:pl-14 sm:text-base sm:leading-8">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
