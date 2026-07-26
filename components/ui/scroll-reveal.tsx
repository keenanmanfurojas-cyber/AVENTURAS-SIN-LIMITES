"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

type ScrollRevealProps = Readonly<{
  children: ReactNode;
  timing?: "default" | "prompt";
}>;

export function ScrollReveal({
  children,
  timing = "default",
}: ScrollRevealProps) {
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = revealRef.current;

    if (!element) {
      return;
    }

    element.dataset.revealReady = "true";
    let observer: IntersectionObserver | null = null;
    let revealTimer = 0;

    const frameId = window.requestAnimationFrame(() => {
      if (!("IntersectionObserver" in window)) {
        element.dataset.revealed = "true";
        return;
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) {
            return;
          }

          observer?.disconnect();
          observer = null;
          revealTimer = window.setTimeout(() => {
            element.dataset.revealed = "true";
          }, timing === "prompt" ? 40 : 120);
        },
        {
          rootMargin:
            timing === "prompt" ? "0px 0px 5% 0px" : "0px 0px -10% 0px",
          threshold: timing === "prompt" ? 0.04 : 0.18,
        },
      );

      observer.observe(element);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(revealTimer);
      observer?.disconnect();
    };
  }, [timing]);

  return (
    <div
      className={`scroll-reveal ${
        timing === "prompt" ? "scroll-reveal--prompt" : ""
      }`}
      ref={revealRef}
    >
      {children}
    </div>
  );
}
