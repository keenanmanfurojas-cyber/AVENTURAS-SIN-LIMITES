import type { ReactNode } from "react";

type PlatformEntryProps = Readonly<{
  children: ReactNode;
  isHydrated: boolean;
  isRevealing: boolean;
  isVisible: boolean;
  sectionRef: React.RefObject<HTMLElement | null>;
}>;

export function PlatformEntry({
  children,
  isHydrated,
  isRevealing,
  isVisible,
  sectionRef,
}: PlatformEntryProps) {
  const shouldRenderVisually = !isHydrated || isRevealing || isVisible;

  return (
    <main
      aria-hidden={isHydrated ? !isVisible : undefined}
      className={`platform-entry relative z-0 isolate min-h-screen bg-obsidian transition-[opacity,transform,filter] duration-[1200ms] ease-refined ${
        shouldRenderVisually
          ? "translate-y-0 opacity-100 blur-0"
          : "translate-y-3 opacity-0 blur-sm"
      }`}
      inert={isHydrated && !isVisible ? true : undefined}
      ref={sectionRef}
      tabIndex={-1}
    >
      {children}
    </main>
  );
}
