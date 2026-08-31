"use client";

import { useMemo, useState } from "react";
import { formatBRL } from "../services/money";
import type { Contribution, ContributionStatus } from "../types/movement";

type ContributionsPanelProps = {
  contributions: Contribution[];
  onToggle: (id: string) => void;
};

export function ContributionsPanel({
  contributions,
  onToggle,
}: ContributionsPanelProps) {
  const [statusFilter, setStatusFilter] = useState<"todos" | ContributionStatus>(
    "todos"
  );

  const filtered = useMemo(
    () =>
      contributions.filter(
        (item) => statusFilter === "todos" || item.status === statusFilter
      ),
    [contributions, statusFilter]
  );

  const pendingCount = contributions.filter((item) => item.status === "pendente").length;
  const received = contributions
    .filter((item) => item.status === "pago")
    .reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-[0_12px_40px_rgba(24,24,27,0.04)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Mensalidades</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {pendingCount} pendente{pendingCount === 1 ? "" : "s"} · {formatBRL(received)}{" "}
            já recebidos neste mês.
          </p>
        </div>
        <div className="flex rounded-full border border-zinc-200 bg-zinc-50 p-1">
          {(
            [
              ["todos", "Todos"],
              ["pendente", "Pendentes"],
              ["pago", "Pagos"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              className={`h-9 rounded-full px-3 text-sm font-medium transition ${statusFilter === value
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-5 divide-y divide-zinc-100">
        {filtered.map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-zinc-900">{item.memberName}</p>
              <p className="mt-1 text-sm text-zinc-500">
                {item.reference} · {formatBRL(item.value)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === "pago"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
                  }`}
              >
                {item.status === "pago" ? "Pago" : "Pendente"}
              </span>
              <button
                type="button"
                onClick={() => onToggle(item.id)}
                className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-rotaract-pink/40 hover:text-rotaract-pink"
              >
                {item.status === "pago" ? "Marcar pendente" : "Confirmar pagamento"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
