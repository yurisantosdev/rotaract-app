"use client";

import { CardProps } from "./types";
import { useCard } from "./services";

export function Card({
  title,
  number,
  colorNumber,
  description,
  formatCurrency = true
}: CardProps) {
  const {
    colorNumberMap,
    formatDisplayed,
    displayed
  } = useCard(number);

  return (
    <article className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4 sm:rounded-3xl sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {title}
      </p>
      <p
        className={`mt-2 min-w-0 truncate text-lg font-semibold tabular-nums sm:text-2xl ${colorNumberMap[colorNumber]}`}
      >
        {formatDisplayed(displayed, number, formatCurrency)}
      </p>
      {description && (
        <p className="mt-2 truncate text-sm text-zinc-500">{description}</p>
      )}
    </article>
  );
}
