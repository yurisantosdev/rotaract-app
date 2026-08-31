"use client";

import { useMemo, useState } from "react";
import { CheckCircleIcon, ArrowCounterClockwiseIcon, HandshakeIcon, TrashIcon } from "@phosphor-icons/react";
import { ConfirmModal, Tooltip } from "@rotaract/components";
import { formatBRL } from "../services/money";
import { Contribution, ContributionStatus } from "../types/contributions";

type ContributionsPanelProps = {
  contributions: Contribution[];
  onToggle: (id: string) => void;
  onExempt: (id: string) => void;
  onRemove: (id: string) => void;
};

export function ContributionsPanel({
  contributions,
  onToggle,
  onExempt,
  onRemove,
}: ContributionsPanelProps) {
  const [statusFilter, setStatusFilter] = useState<"todos" | ContributionStatus>(
    "todos"
  );
  const [contributionToDelete, setContributionToDelete] =
    useState<Contribution | null>(null);

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
              ["isento", "Isentos"],
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

      <ConfirmModal
        open={Boolean(contributionToDelete)}
        title="Excluir mensalidade"
        description={
          contributionToDelete
            ? `Deseja realmente excluir a mensalidade de “${contributionToDelete.name}”? Esta ação não pode ser desfeita.`
            : undefined
        }
        confirmLabel="Excluir"
        onClose={() => setContributionToDelete(null)}
        onConfirm={() => {
          if (!contributionToDelete) return;
          onRemove(contributionToDelete.id);
          setContributionToDelete(null);
        }}
      />

      <ul className="mt-5 divide-y divide-zinc-100">
        {filtered.map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-zinc-900">{item.name}</p>
              <p className="mt-1 text-sm text-zinc-500">
                {item.reference} · {formatBRL(item.value)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === "pago"
                  ? "bg-emerald-50 text-emerald-700"
                  : item.status === "isento"
                    ? "bg-sky-50 text-sky-700"
                    : "bg-amber-50 text-amber-700"
                  }`}
              >
                {item.status === "pago"
                  ? "Pago"
                  : item.status === "isento"
                    ? "Isento"
                    : "Pendente"}
              </span>
              <div className="flex gap-2">
                {item.status === "pendente" ? (
                  <Tooltip label="Confirmar pagamento">
                    <button
                      type="button"
                      aria-label="Confirmar pagamento"
                      onClick={() => onToggle(item.id)}
                      className="rounded-full p-1.5 text-sm text-zinc-500 transition hover:bg-emerald-50 hover:text-zinc-800"
                    >
                      <CheckCircleIcon className="h-4 w-4 text-emerald-600 group-hover/tooltip:text-emerald-700" />
                    </button>
                  </Tooltip>
                ) : (
                  <Tooltip label="Marcar pendente">
                    <button
                      type="button"
                      aria-label="Marcar pendente"
                      onClick={() => onToggle(item.id)}
                      className="rounded-full p-1.5 text-sm text-zinc-500 transition hover:bg-amber-50 hover:text-zinc-800"
                    >
                      <ArrowCounterClockwiseIcon className="h-4 w-4 text-amber-600 group-hover/tooltip:text-amber-700" />
                    </button>
                  </Tooltip>
                )}
                {item.status !== "isento" ? (
                  <Tooltip label="Isentar">
                    <button
                      type="button"
                      aria-label="Isentar"
                      onClick={() => onExempt(item.id)}
                      className="rounded-full p-1.5 text-sm text-zinc-500 transition hover:bg-sky-50 hover:text-zinc-800"
                    >
                      <HandshakeIcon className="h-4 w-4 text-sky-600 group-hover/tooltip:text-sky-700" />
                    </button>
                  </Tooltip>
                ) : null}
                <Tooltip label="Excluir">
                  <button
                    type="button"
                    aria-label="Excluir"
                    onClick={() => setContributionToDelete(item)}
                    className="rounded-full p-1.5 text-sm text-zinc-500 transition hover:bg-rose-50 hover:text-zinc-800"
                  >
                    <TrashIcon className="h-4 w-4 text-red-500 group-hover/tooltip:text-red-600" />
                  </button>
                </Tooltip>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
