"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

type InViewRevealProps = Readonly<{
  children: ReactNode;
  className?: string;
  delay?: number;
}>;

export function InViewReveal({
  children,
  className = "",
  delay = 0,
}: InViewRevealProps) {
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = revealRef.current;

    if (!element) {
      return;
    }

    element.dataset.revealReady = "true";

    if (!("IntersectionObserver" in window)) {
      element.dataset.revealed = "true";
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        element.dataset.revealed = "true";
        observer.disconnect();
      },
      {
        rootMargin: "0px 0px -6% 0px",
        threshold: 0.12,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`in-view-reveal ${className}`}
      ref={revealRef}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
