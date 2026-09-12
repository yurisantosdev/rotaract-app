"use client";

import { formatBRL } from "../../services/money.services";
import { ButtonExcel } from "@rotaract/components";
import { DescriptionReportPanel } from "./_components/DescriptionReportPanel";
import { ReportPanelProps } from "./types";
import { useReportPanel } from "./services";

export function ReportPanel({
  movements,
  contributions,
  onDownload,
}: ReportPanelProps) {
  const {
    income,
    expense,
    paidMembers,
    byCategory
  } = useReportPanel({ movements, contributions });

  return (
    <section className="min-w-0 overflow-hidden rounded-3xl border border-zinc-200 bg-white p-4 shadow-[0_12px_40px_rgba(24,24,27,0.04)] sm:p-6">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-zinc-900">Relatório</h2>

          <span className="md:flex hidden">
            <DescriptionReportPanel />
          </span>
        </div>

        <ButtonExcel
          onClick={() => onDownload()}
        />
      </div>

      <span className="md:hidden flex mt-3">
        <DescriptionReportPanel />
      </span>

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-rotaract-mist p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Entradas
          </dt>
          <dd className="mt-1 truncate text-lg font-semibold text-emerald-600 sm:text-xl">{formatBRL(income)}</dd>
        </div>
        <div className="rounded-2xl bg-rotaract-mist p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Saídas
          </dt>
          <dd className="mt-1 truncate text-lg font-semibold text-rose-500 sm:text-xl">{formatBRL(expense)}</dd>
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
            className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-zinc-100 px-4 py-3 text-sm"
          >
            <span className="min-w-0 truncate text-zinc-600">{category}</span>
            <span className={`shrink-0 ${total >= 0 ? "font-medium text-emerald-600" : "font-medium text-rose-500"}`}>
              {formatBRL(total)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
