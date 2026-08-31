"use client";

import { useEffect, useRef, useState } from "react";
import { formatBRL } from "../services/money";

type CardProps = {
  title: string;
  number: number;
  colorNumber: "green" | "red" | "black";
  description?: string;
  formatCurrency?: boolean;
};

const colorNumberMap = {
  green: "text-emerald-600",
  red: "text-rose-500",
  black: "text-zinc-900",
};

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

function formatDisplayed(
  displayed: number,
  target: number,
  formatCurrency: boolean
) {
  if (formatCurrency) return formatBRL(displayed);
  if (Number.isInteger(target)) return String(Math.round(displayed));
  return String(displayed);
}

export function Card({ title, number, colorNumber, description, formatCurrency = true }: CardProps) {
  const [displayed, setDisplayed] = useState(0);
  const displayedRef = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const from = displayedRef.current;
    const to = number;

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
  }, [number]);

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 sm:rounded-3xl sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {title}
      </p>
      <p
        className={`mt-2 text-xl font-semibold tabular-nums sm:text-2xl ${colorNumberMap[colorNumber]}`}
      >
        {formatDisplayed(displayed, number, formatCurrency)}
      </p>
      {description && (
        <p className="mt-2 text-sm text-zinc-500">{description}</p>
      )}
    </article>
  );
}
