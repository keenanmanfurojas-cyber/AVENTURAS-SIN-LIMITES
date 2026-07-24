import type { ReactNode } from "react";

type VolcanicBackgroundProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

export function VolcanicBackground({
  children,
  className = "",
}: VolcanicBackgroundProps) {
  return (
    <div className={`volcanic-background ${className}`}>{children}</div>
  );
}
