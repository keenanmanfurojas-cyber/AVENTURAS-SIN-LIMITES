"use client";

import { useEffect } from "react";

export function ScrollToTop() {
  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    const restoreDestination = () => {
      const targetId = decodeURIComponent(window.location.hash.slice(1));
      const target = targetId ? document.getElementById(targetId) : null;

      if (target) {
        target.scrollIntoView({
          behavior: "auto",
          block: "start",
        });
        return;
      }

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    };

    restoreDestination();

    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      restoreDestination();
      secondFrame = window.requestAnimationFrame(restoreDestination);
    });

    window.addEventListener("pageshow", restoreDestination);

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.removeEventListener("pageshow", restoreDestination);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  return null;
}
