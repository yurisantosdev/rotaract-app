"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { NewManagementModalProps } from "./type";

export function useNewManagementModal({
  open,
  existingNames,
  currentManagement,
  onClose,
  onCreate,
}: NewManagementModalProps) {
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const isClosing = Boolean(currentManagement);

  useEffect(() => {
    if (!open) return;
    setName("");
    setError("");
    setSaving(false);
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();

    if (trimmed.length < 3) {
      setError("Informe o nome da gestão com pelo menos 3 caracteres.");
      return;
    }

    const exists = existingNames.some(
      (item) => item.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setError("Já existe uma gestão com esse nome.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      await onCreate(trimmed);
      onClose();
    } catch {
      setError(
        isClosing
          ? "Não foi possível finalizar a gestão."
          : "Não foi possível criar a gestão."
      );
    } finally {
      setSaving(false);
    }
  }

  return {
    nameRef,
    name,
    setName,
    error,
    saving,
    isClosing,
    handleSubmit,
  };
}
