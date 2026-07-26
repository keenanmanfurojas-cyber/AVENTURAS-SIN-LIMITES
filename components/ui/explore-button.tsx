import Link from "next/link";

type ExploreButtonProps = Readonly<{
  ariaLabel?: string;
  className?: string;
  href: string;
}>;

export function ExploreButton({
  ariaLabel = "Explorar Aventuras Sin Límites",
  className = "",
  href,
}: ExploreButtonProps) {
  return (
    <Link
      aria-label={ariaLabel}
      className={`intro-explore-button group relative min-h-12 min-w-44 overflow-hidden rounded-full border border-white/40 bg-white/[0.07] px-9 py-4 font-[family-name:var(--font-poppins)] text-[0.68rem] font-medium uppercase tracking-[0.3em] text-white shadow-[0_0_24px_rgba(255,154,79,0.12)] backdrop-blur-md transition duration-500 ease-refined hover:-translate-y-0.5 hover:border-white/65 hover:bg-white/[0.12] hover:shadow-[0_0_30px_rgba(255,154,79,0.2)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 sm:min-w-52 ${className}`}
      href={href}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
      <span className="relative">Explorar</span>
    </Link>
  );
}
