import type { ReactNode } from "react";

type BadgeProps = Readonly<{
  children: ReactNode;
  className?: string;
  tone?: "lava" | "neutral" | "smoke";
}>;

const toneClasses = {
  lava: "border-lava/40 bg-lava/10 text-ember",
  neutral: "border-white/15 bg-black/30 text-ash",
  smoke: "border-smoke/20 bg-smoke/[0.06] text-smoke",
};

export function Badge({
  children,
  className = "",
  tone = "neutral",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex min-h-7 items-center border px-3 py-1 text-[0.52rem] font-semibold uppercase tracking-[0.2em] backdrop-blur-sm ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
