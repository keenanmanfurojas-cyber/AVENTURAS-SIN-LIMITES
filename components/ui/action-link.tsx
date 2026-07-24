import type { ReactNode } from "react";

import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/types/content";

type ActionLinkProps = Readonly<{
  children: ReactNode;
  className?: string;
  external?: boolean;
  href: string;
  icon?: IconName;
  variant?: "primary" | "secondary" | "ghost";
}>;

export function ActionLink({
  children,
  className = "",
  external = false,
  href,
  icon = "arrow",
  variant = "primary",
}: ActionLinkProps) {
  const variantClasses = {
    primary:
      "border-lava bg-lava text-white shadow-lava hover:-translate-y-0.5 hover:border-molten hover:bg-molten hover:shadow-[0_0_38px_rgba(228,69,47,0.36)] active:translate-y-0",
    secondary:
      "border-white/18 bg-white/[0.055] text-smoke shadow-glass backdrop-blur-md hover:-translate-y-0.5 hover:border-ember/55 hover:bg-white/[0.09] hover:text-white active:translate-y-0",
    ghost:
      "border-transparent bg-transparent text-ash hover:border-white/15 hover:bg-white/[0.04] hover:text-smoke",
  }[variant];

  return (
    <a
      className={`group inline-flex min-h-12 items-center justify-center gap-3 rounded-full border px-6 text-[0.6rem] font-bold uppercase tracking-[0.2em] transition duration-500 ease-refined ${variantClasses} ${className}`}
      href={href}
      rel={external ? "noopener noreferrer" : undefined}
      target={external ? "_blank" : undefined}
    >
      {icon !== "arrow" ? <Icon className="size-4" name={icon} /> : null}
      {children}
      {icon === "arrow" ? (
        <Icon
          className="size-4 transition-transform duration-500 group-hover:translate-x-1"
          name="arrow"
        />
      ) : null}
    </a>
  );
}
