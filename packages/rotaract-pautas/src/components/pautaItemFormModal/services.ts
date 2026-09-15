"use client";

import { AlertError, AlertSuccess } from "@rotaract/components";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { PautaItemStatus } from "../../types/pautaItems";
import type { PautaItemFormModalProps } from "./type";

export function usePautaItemFormModal({
  open,
  item,
  defaultResponsibleId,
  onClose,
  onSave,
}: PautaItemFormModalProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(item);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [responsibleId, setResponsibleId] = useState("");
  const [status, setStatus] = useState<PautaItemStatus>("pendente");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setTitle(item?.title ?? "");
    setDescription(item?.description ?? "");
    setResponsibleId(item?.responsibleId ?? defaultResponsibleId ?? "");
    setStatus(item?.status ?? "pendente");
    setError("");
    setSaving(false);
  }, [defaultResponsibleId, item, open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 3) {
      setError("Informe um título com pelo menos 3 caracteres.");
      return;
    }

    if (!responsibleId) {
      setError("Escolha o membro responsável pelo item.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave({
        title: trimmedTitle,
        description: description.trim(),
        responsibleId,
        status,
      });
      AlertSuccess("Item da pauta salvo com sucesso");
      onClose();
    } catch (caught) {
      AlertError("Não foi possível salvar o item.");
      setError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível salvar o item."
      );
    } finally {
      setSaving(false);
    }
  }

  return {
    titleRef,
    isEdit,
    title,
    setTitle,
    description,
    setDescription,
    responsibleId,
    setResponsibleId,
    status,
    setStatus,
    error,
    saving,
    handleSubmit,
  };
}
