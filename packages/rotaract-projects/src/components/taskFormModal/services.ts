"use client";

import { AlertError, AlertSuccess } from "@rotaract/components";
import { todayISO } from "../../../src/lib/dates";
import { TaskStatus } from "../../../src/types/tasks";
import { FormEvent, useEffect, useRef, useState } from "react";
import { TaskFormModalProps } from "./type";

export function useTaskFormModal({
  task,
  members,
  defaultManagerId,
  onClose,
  onSave
}: TaskFormModalProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(task);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [managerId, setManagerId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [limit, setLimit] = useState(todayISO());
  const [status, setStatus] = useState<TaskStatus>("new");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setManagerId(task?.managerId ?? defaultManagerId ?? "");
    setDate(task?.date ?? todayISO());
    setLimit(task?.limit ?? todayISO());
    setStatus(task?.status ?? "new");
    setError("");
    setSaving(false);
  }, [defaultManagerId, open, task]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (trimmedTitle.length < 3) {
      setError("Informe um título com pelo menos 3 caracteres.");
      return;
    }

    if (trimmedDescription.length < 3) {
      setError("Informe uma descrição com pelo menos 3 caracteres.");
      return;
    }

    if (!managerId) {
      setError("Escolha o membro responsável pela tarefa.");
      return;
    }

    if (limit < date) {
      setError("O prazo não pode ser anterior à data da tarefa.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave({
        title: trimmedTitle,
        description: trimmedDescription,
        managerId,
        date,
        status,
        limit,
      });
      AlertSuccess("Tarefa salva com sucesso");
      onClose();
    } catch (caught) {
      AlertError("Não foi possível salvar a tarefa.");
      setError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível salvar a tarefa."
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
    managerId,
    setManagerId,
    date,
    setDate,
    limit,
    setLimit,
    status,
    setStatus,
    error,
    saving,
    handleSubmit
  };
}
