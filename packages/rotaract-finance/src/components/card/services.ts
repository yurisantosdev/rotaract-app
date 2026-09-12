"use client";

import { formatBRL } from "../../../src/services/money.services";
import { useAnimatedNumber } from "@rotaract/components";

export function useCard(number: number) {
  const displayed = useAnimatedNumber(number);

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

  return {
    colorNumberMap,
    formatDisplayed,
    displayed
  };
}
