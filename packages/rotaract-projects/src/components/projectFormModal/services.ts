"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ProjectFormModalProps } from "./type";
import { uniqueIds } from "../../../src/types/projects";
import { AlertError, AlertSuccess } from "@rotaract/components";

export function useProjectFormModal({
  open,
  project,
  currentUserId,
  onClose,
  onSave,
}: ProjectFormModalProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(project);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [managerId, setManagerId] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    const initialManager = project?.managerId ?? currentUserId ?? "";
    setTitle(project?.title ?? "");
    setDescription(project?.description ?? "");
    setManagerId(initialManager);
    setMemberIds(
      uniqueIds([initialManager, ...(project?.members ?? [])].filter(Boolean))
    );
    setError("");
    setSaving(false);
  }, [currentUserId, open, project]);

  function handleManagerChange(ids: string[]) {
    const nextManager = ids[0] ?? "";
    setManagerId(nextManager);
    setMemberIds((current) => uniqueIds([nextManager, ...current]));
  }

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
      setError("Escolha o membro responsável pelo projeto.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave({
        title: trimmedTitle,
        description: trimmedDescription,
        managerId,
        members: uniqueIds([managerId, ...memberIds]),
      });
      AlertSuccess("Projeto salvo com sucesso");
      onClose();
    } catch (caught) {
      AlertError("Não foi possível salvar o projeto.");
      setError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível salvar o projeto."
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
    memberIds,
    setMemberIds,
    error,
    saving,
    handleSubmit,
    handleManagerChange
  };
}
