"use client";

import { UseReportPanelProps } from "./types";

export function useReportPanel({
  movements,
  contributions
}: UseReportPanelProps) {
  const income = movements
    .filter((item) => item.type === "entrada")
    .reduce((sum, item) => sum + item.value, 0);
  const expense = movements
    .filter((item) => item.type === "saida")
    .reduce((sum, item) => sum + item.value, 0);
  const paidMembers = contributions.filter((item) => item.status === "pago").length;

  const byCategory = movements.reduce<Record<string, number>>((acc, item) => {
    const signal = item.type === "entrada" ? 1 : -1;
    acc[item.category] = (acc[item.category] ?? 0) + item.value * signal;
    return acc;
  }, {});
  return {
    income,
    expense,
    paidMembers,
    byCategory,
  };
}
