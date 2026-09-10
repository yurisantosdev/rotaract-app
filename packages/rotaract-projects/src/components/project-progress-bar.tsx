"use client";

import { useEffect, useState } from "react";
import { useAnimatedNumber } from "@rotaract/components";

type ProjectProgressBarProps = {
  completed: number;
  total: number;
  percent: number;
  delayMs?: number;
  className?: string;
  itemLabel?: {
    singular: string;
    plural: string;
  };
};

export function ProjectProgressBar({
  completed,
  total,
  percent,
  delayMs = 180,
  className = "mt-4",
  itemLabel = { singular: "tarefa", plural: "tarefas" },
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

  return (
    <div className={className}>
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>
          {completed}/{total}{" "}
          {total === 1 ? itemLabel.singular : itemLabel.plural}
        </span>
        <span className="tabular-nums">{Math.round(displayed)}%</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-200">
        <div
          className="h-full rounded-full bg-rotaract-pink"
          style={{ width: `${displayed}%` }}
        />
      </div>
    </div>
  );
}
