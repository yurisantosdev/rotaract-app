"use client";

import { useAnimatedNumber } from "@rotaract/components";
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
  const displayed = useAnimatedNumber(number);

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
