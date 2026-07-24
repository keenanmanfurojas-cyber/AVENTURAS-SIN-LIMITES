import type { ElementType, ReactNode } from "react";

type GlassPanelProps = Readonly<{
  as?: ElementType;
  children: ReactNode;
  className?: string;
}>;

export function GlassPanel({
  as: Component = "div",
  children,
  className = "",
}: GlassPanelProps) {
  return (
    <Component className={`glass-panel ${className}`}>{children}</Component>
  );
}
