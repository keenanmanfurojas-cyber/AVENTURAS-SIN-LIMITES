import type { ElementType, ReactNode } from "react";

type ContainerProps = Readonly<{
  as?: ElementType;
  children: ReactNode;
  className?: string;
}>;

export function Container({
  as: Component = "div",
  children,
  className = "",
}: ContainerProps) {
  return (
    <Component
      className={`mx-auto w-full max-w-[var(--container-max)] px-6 sm:px-8 lg:px-12 ${className}`}
    >
      {children}
    </Component>
  );
}
