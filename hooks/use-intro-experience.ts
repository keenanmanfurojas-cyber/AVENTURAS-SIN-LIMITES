"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { IntroPhase } from "@/types/experience";

const TRANSITION_DURATION_MS = 650;
const REDUCED_TRANSITION_DURATION_MS = 80;

export function useIntroExperience() {
  const [phase, setPhase] = useState<IntroPhase>("idle");
  const [hasMounted, setHasMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const destinationRef = useRef<HTMLElement>(null);
  const shouldRestoreFocus = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    setHasMounted(true);
    setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => {
      mediaQuery.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  useEffect(() => {
    if (!hasMounted || phase === "entered") {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousOverscrollBehavior =
      document.documentElement.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.documentElement.style.overscrollBehavior =
        previousOverscrollBehavior;
    };
  }, [hasMounted, phase]);

  const enterExperience = useCallback((restoreFocus = false) => {
    setPhase((currentPhase) => {
      if (currentPhase !== "idle") {
        return currentPhase;
      }

      shouldRestoreFocus.current = restoreFocus;

      return "departing";
    });
  }, []);

  useEffect(() => {
    if (phase !== "departing") {
      return;
    }

    const duration = prefersReducedMotion
      ? REDUCED_TRANSITION_DURATION_MS
      : TRANSITION_DURATION_MS;
    const startedAt = performance.now();
    let frameId = 0;

    const completeAfterTransition = (currentTime: number) => {
      if (currentTime - startedAt >= duration) {
        setPhase("entered");
        if (shouldRestoreFocus.current) {
          destinationRef.current?.focus({ preventScroll: true });
        }
        return;
      }

      frameId = window.requestAnimationFrame(completeAfterTransition);
    };

    frameId = window.requestAnimationFrame(completeAfterTransition);
    return () => window.cancelAnimationFrame(frameId);
  }, [phase, prefersReducedMotion]);

  return {
    destinationRef,
    enterExperience,
    hasMounted,
    phase,
    prefersReducedMotion,
  };
}
