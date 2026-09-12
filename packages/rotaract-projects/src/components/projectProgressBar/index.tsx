"use client";

import { ProjectProgressBarProps } from "./type";
import { useProjectProgressBar } from "./services";

export function ProjectProgressBar({
  completed,
  total,
  percent,
  delayMs = 180,
  className = "mt-4",
  itemLabel = { singular: "tarefa", plural: "tarefas" },
}: ProjectProgressBarProps) {
  const data = useProjectProgressBar({
    completed,
    total,
    percent,
    delayMs,
    className,
    itemLabel,
  });
  if (!data) return null;
  const { displayed } = data;

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
