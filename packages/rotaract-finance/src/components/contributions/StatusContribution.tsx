import { Contribution } from "../../types/contributions";
import React from "react";

export type StatusContributionProps = {
  status: Contribution;
}

export function StatusContribution({ status }: StatusContributionProps) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${status.status === "pago"
        ? "bg-emerald-50 text-emerald-700"
        : status.status === "isento"
          ? "bg-sky-50 text-sky-700"
          : "bg-amber-50 text-amber-700"
        }`}
    >
      {status.status === "pago"
        ? "Pago"
        : status.status === "isento"
          ? "Isento"
          : "Pendente"}
    </span>
  )
}