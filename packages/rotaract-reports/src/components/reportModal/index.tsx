"use client";

import { TrashIcon } from "@phosphor-icons/react";
import { Button, ConfirmModal, Modal } from "@rotaract/components";
import {
  REPORTS_INPUT_CLASS,
  REPORTS_STATUS_OPTIONS,
} from "../../types/reports";
import { ReportImageViewer } from "../reportImageViewer";
import { useReportModal } from "./services";
import type { ReportModalProps } from "./type";

export function ReportModal({
  open,
  report,
  onClose,
  onSave,
  onRemove,
}: ReportModalProps) {
  const data = useReportModal({ open, report, onClose, onSave, onRemove });
  if (!data || !report) return null;

  const {
    description,
    setDescription,
    returnFeedback,
    setReturnFeedback,
    status,
    setStatus,
    error,
    saving,
    removing,
    confirmRemove,
    setConfirmRemove,
    handleSubmit,
    handleRemove,
  } = data;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        eyebrow="Feedbacks"
        title="Editar Feedback"
        description="Atualize o status e informe o retorno para quem reportou o bug."
        size="lg"
      >
        <form
          onSubmit={handleSubmit}
          className="max-h-[min(72vh,40rem)] overflow-y-auto px-5 py-5 sm:px-6"
        >
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-rotaract-mist p-1">
            {REPORTS_STATUS_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setStatus(option.id)}
                className={`h-11 rounded-[1.1rem] text-sm font-semibold transition ${status === option.id
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800"
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <p className="mt-5 text-xs font-medium uppercase tracking-wide text-zinc-400">
            Registrado em {report.date}
          </p>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm text-zinc-600">
              Retorno do feedback
            </span>
            <textarea
              value={returnFeedback}
              onChange={(event) => setReturnFeedback(event.target.value)}
              rows={4}
              required
              className={`${REPORTS_INPUT_CLASS} h-auto resize-y py-3`}
              placeholder="Explique o que foi feito ou o próximo passo para quem reportou..."
            />
          </label>

          <label className="mt-3 block">
            <span className="mb-1.5 block text-sm text-zinc-600">Descrição</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              required
              className={`${REPORTS_INPUT_CLASS} h-auto resize-y py-3`}
              placeholder="Descreva o bug..."
            />
          </label>

          {report.image ? <ReportImageViewer src={report.image} /> : null}

          {error ? (
            <p className="mt-4 text-sm text-rose-500" role="alert">
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-4">
            <button
              type="button"
              onClick={() => setConfirmRemove(true)}
              disabled={saving || removing}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-40"
            >
              <TrashIcon size={16} weight="bold" />
              Excluir
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving || removing}
                className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <Button
                type="submit"
                title={saving ? "Salvando..." : "Salvar"}
                disabled={saving || removing}
                className="min-w-28"
              />
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={confirmRemove}
        title="Excluir Feedback?"
        description="Essa ação remove o Feedback permanentemente."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onClose={() => setConfirmRemove(false)}
        onConfirm={() => {
          void handleRemove();
        }}
      />
    </>
  );
}
