"use client";

import { useEffect, useState } from "react";
import {
  ReportsStatus,
  type ReportsPayload,
  type ReportsStatus as ReportsStatusValue,
} from "../../types/reports";
import type { ReportModalProps } from "./type";

export function useReportModal({
  report,
  onSave,
  onRemove,
  onClose,
  open,
}: ReportModalProps) {
  const [description, setDescription] = useState("");
  const [returnFeedback, setReturnFeedback] = useState("");
  const [status, setStatus] = useState<ReportsStatusValue>(
    ReportsStatus.PENDING
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  useEffect(() => {
    if (!open || !report) return;
    setDescription(report.description);
    setReturnFeedback(report.returnFeedback ?? "");
    setStatus(report.status);
    setError("");
    setSaving(false);
    setRemoving(false);
    setConfirmRemove(false);
  }, [open, report]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!report) return;

    const trimmed = description.trim();
    if (!trimmed) {
      setError("Campo descrição é obrigatório");
      return;
    }

    const trimmedReturn = returnFeedback.trim();
    if (!trimmedReturn) {
      setError("Campo retorno do feedback é obrigatório");
      return;
    }

    const payload: ReportsPayload = {
      description: trimmed,
      status,
      returnFeedback: trimmedReturn,
    };

    setSaving(true);
    setError("");
    try {
      await onSave(report.id, payload);
      onClose();
    } catch {
      setError("Não foi possível salvar as alterações.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    if (!report) return;
    setRemoving(true);
    setError("");
    try {
      await onRemove(report.id);
      onClose();
    } catch {
      setError("Não foi possível excluir o Feedback.");
      setConfirmRemove(false);
    } finally {
      setRemoving(false);
    }
  }

  return {
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
  };
}
