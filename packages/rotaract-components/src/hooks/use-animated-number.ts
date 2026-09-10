"use client";

import { useEffect, useRef, useState } from "react";

const DURATION_MS = 900;

function easeOutCubic(progress: number) {
  return 1 - (1 - progress) ** 3;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function useAnimatedNumber(target: number) {
  const [displayed, setDisplayed] = useState(0);
  const displayedRef = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const from = displayedRef.current;
    const to = target;

    cancelAnimationFrame(frameRef.current);

    if (from === to || prefersReducedMotion()) {
      displayedRef.current = to;
      setDisplayed(to);
      return;
    }

    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / DURATION_MS, 1);
      const next = from + (to - from) * easeOutCubic(progress);
      displayedRef.current = next;
      setDisplayed(next);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        displayedRef.current = to;
        setDisplayed(to);
      }
    }

    frameRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameRef.current);
  }, [target]);

  return displayed;
}
