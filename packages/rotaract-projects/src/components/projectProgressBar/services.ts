"use client";

import { useAnimatedNumber } from "@rotaract/components";
import { useEffect, useState } from "react";
import { ProjectProgressBarProps } from "./type";

export function useProjectProgressBar({
  completed,
  total,
  percent,
  delayMs,
  className,
  itemLabel,
}: ProjectProgressBarProps) {
  const [target, setTarget] = useState(0);
  const displayed = useAnimatedNumber(target);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wait = reduced ? 0 : delayMs;
    const id = window.setTimeout(() => setTarget(percent), wait);
    return () => window.clearTimeout(id);
  }, [delayMs, percent]);

  return {
    displayed
  };
}
