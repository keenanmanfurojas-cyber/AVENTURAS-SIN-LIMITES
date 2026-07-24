import type { ReactNode } from "react";

import { VolcanicBackground } from "@/components/effects/volcanic-background";

type SiteShellProps = Readonly<{
  children: ReactNode;
}>;

export function SiteShell({ children }: SiteShellProps) {
  return (
    <VolcanicBackground className="min-h-screen overflow-x-hidden">
      {children}
    </VolcanicBackground>
  );
}
