"use client";

import {
  BugBeetleIcon,
  EyeIcon,
  ImageIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Button, ConfirmModal, Tooltip } from "@rotaract/components";
import {
  REPORTS_FILTERS,
  REPORTS_INPUT_CLASS,
} from "../../types/reports";
import { ReportModal } from "../reportModal";
import { StatusBadge } from "./_components/StatusBadge";
import { useReportsPanel } from "./services";
import type { ReportsPanelProps } from "./type";

export function ReportsPanel({
  reports,
  onUpdate,
  onRemove,
}: ReportsPanelProps) {
  const data = useReportsPanel({ reports, onRemove });
  if (!data) return null;

  const {
    query,
    setQuery,
    filter,
    setFilter,
    filtered,
    editing,
    setEditing,
    formOpen,
    closeForm,
    reportToRemove,
    setReportToRemove,
    removing,
    confirmRemove,
  } = data;

  return (
    <section className="mt-8 rounded-3xl border border-zinc-200 bg-white p-4 shadow-[0_12px_40px_rgba(24,24,27,0.04)] sm:p-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Feedbacks</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Busque, filtre e atualize o andamento dos bugs reportados.
        </p>
      </div>

      <div className="mt-5 md:flex justify-between gap-3 lg:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className={REPORTS_INPUT_CLASS}
          placeholder="Pesquisar..."
        />
        <div className="md:w-[70%] w-full md:mt-0 mt-4 flex justify-between overflow-x-auto rounded-full border border-zinc-200 bg-zinc-50 p-1">
          {REPORTS_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`h-9 shrink-0 rounded-full px-3 text-sm font-medium transition ${filter === item.id
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-zinc-400">
        {filtered.length} {filtered.length === 1 ? "reporte" : "reportes"}
      </p>

      <ul className="mt-2 divide-y divide-zinc-100">
        {filtered.length === 0 ? (
          <li className="flex flex-col items-center px-4 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rotaract-pink/10 text-rotaract-pink">
              <BugBeetleIcon className="h-6 w-6" weight="bold" aria-hidden />
            </span>
            <p className="mt-4 text-sm font-medium text-zinc-800">
              {reports.length === 0
                ? "Nenhum Feedback cadastrado ainda."
                : "Nenhum Feedback encontrado com esses filtros."}
            </p>
            <p className="mt-1 max-w-sm text-sm text-zinc-500">
              {reports.length === 0
                ? "Os bugs enviados pelo botão flutuante aparecem aqui."
                : "Tente outra busca ou limpe o filtro para ver a lista completa."}
            </p>
          </li>
        ) : (
          filtered.map((report) => (
            <li
              key={report.id}
              className="flex items-start justify-between gap-3 py-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={report.status} />
                  <span className="text-xs text-zinc-400">{report.date}</span>
                  {report.image ? (
                    <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                      <ImageIcon size={14} weight="bold" />
                      Print
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-zinc-800">
                  {report.description}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Tooltip label="Visializar Feedback">
                  <Button
                    aria-label="Visializar Feedback"
                    icon={<EyeIcon className="h-5 w-5" />}
                    onClick={() => setEditing(report)}
                    className="!rounded-2xl"
                  />
                </Tooltip>
                <Tooltip label="Excluir Feedback">
                  <button
                    type="button"
                    aria-label="Excluir Feedback"
                    onClick={() => setReportToRemove(report)}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-200 bg-white text-rose-600 transition hover:bg-rose-50"
                  >
                    <TrashIcon className="h-5 w-5" weight="bold" />
                  </button>
                </Tooltip>
              </div>
            </li>
          ))
        )}
      </ul>

      <ReportModal
        open={formOpen}
        report={editing}
        onClose={closeForm}
        onSave={onUpdate}
        onRemove={onRemove}
      />

      <ConfirmModal
        open={Boolean(reportToRemove)}
        title="Excluir Feedback?"
        description="Essa ação remove o Feedback permanentemente."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        loading={removing}
        onClose={() => setReportToRemove(null)}
        onConfirm={() => {
          void confirmRemove();
        }}
      />
    </section>
  );
}
