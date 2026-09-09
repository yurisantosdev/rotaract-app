import { Contribution, ContributionStatus } from "../../types/contributions";
import React from "react";

const STATUS_UI: Record<ContributionStatus, { label: string; className: string }> = {
  pago: { label: "Pago", className: "bg-emerald-50 text-emerald-700" },
  isento: { label: "Isento", className: "bg-sky-50 text-sky-700" },
  pendente: { label: "Pendente", className: "bg-amber-50 text-amber-700" },
  vencido: { label: "Vencido", className: "bg-rose-50 text-rose-700" },
};

export type StatusContributionProps = {
  status: Contribution;
}

export function StatusContribution({ status }: StatusContributionProps) {
  const ui = STATUS_UI[status.status] ?? STATUS_UI.pendente;

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ui.className}`}>
      {ui.label}
    </span>
  )
}
