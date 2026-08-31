"use client";

import { formatBRL } from "../services/money";
import type { Contribution, Movement } from "../types/movement";

type ReportPanelProps = {
  movements: Movement[];
  contributions: Contribution[];
  onDownload: () => void;
};

export function ReportPanel({
  movements,
  contributions,
  onDownload,
}: ReportPanelProps) {
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

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-[0_12px_40px_rgba(24,24,27,0.04)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Prestação de contas</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Resumo de exemplo para assembleia, com totais e categorias.
          </p>
        </div>
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex h-11 items-center justify-center rounded-full bg-rotaract-pink px-4 text-sm font-semibold text-white transition hover:bg-rotaract-magenta"
        >
          Baixar resumo
        </button>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-rotaract-mist p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Entradas
          </dt>
          <dd className="mt-1 text-xl font-semibold text-emerald-600">{formatBRL(income)}</dd>
        </div>
        <div className="rounded-2xl bg-rotaract-mist p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Saídas
          </dt>
          <dd className="mt-1 text-xl font-semibold text-rose-500">{formatBRL(expense)}</dd>
        </div>
        <div className="rounded-2xl bg-rotaract-mist p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Mensalidades pagas
          </dt>
          <dd className="mt-1 text-xl font-semibold text-zinc-900">
            {paidMembers}/{contributions.length}
          </dd>
        </div>
      </dl>

      <h3 className="mt-8 text-sm font-semibold text-zinc-900">Por categoria</h3>
      <ul className="mt-3 space-y-2">
        {Object.entries(byCategory).map(([category, total]) => (
          <li
            key={category}
            className="flex items-center justify-between rounded-2xl border border-zinc-100 px-4 py-3 text-sm"
          >
            <span className="text-zinc-600">{category}</span>
            <span className={total >= 0 ? "font-medium text-emerald-600" : "font-medium text-rose-500"}>
              {formatBRL(total)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
