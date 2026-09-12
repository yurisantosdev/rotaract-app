"use client";

import { createNotices } from "../../../src/services/database.notices.services";
import { useMembers, useMembersError, useMembersStatus } from "@rotaract/members";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { NoticesModalProps } from "./type";

export function useNoticesModal({ onCreated, onClose, open }: NoticesModalProps) {
  function normalizeSearch(value: string): string {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }
  const titleRef = useRef<HTMLInputElement>(null);
  const members = useMembers();
  const membersStatus = useMembersStatus();
  const membersError = useMembersError();
  const loadingMembers = membersStatus === "idle" || membersStatus === "loading";
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setTitle("");
    setMessage("");
    setQuery("");
    setSelectedIds([]);
    setError("");
    setSaving(false);
  }, [open]);

  const displayedError =
    error ||
    (membersStatus === "failed"
      ? membersError ?? "Não foi possível carregar os membros."
      : "");

  const filteredMembers = useMemo(() => {
    const term = normalizeSearch(query);
    if (!term) return members;

    return members.filter((member) => {
      const name = normalizeSearch(member.name);
      const email = normalizeSearch(member.email ?? "");
      const role = normalizeSearch(member.role);
      return name.includes(term) || email.includes(term) || role.includes(term);
    });
  }, [members, query]);

  const visibleIds = filteredMembers.map((member) => member.id);
  const allSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const selectedMembers = members.filter((member) =>
    selectedIds.includes(member.id)
  );

  function toggleAll() {
    setSelectedIds((current) => {
      if (allSelected) {
        return current.filter((id) => !visibleIds.includes(id));
      }
      return Array.from(new Set([...current, ...visibleIds]));
    });
  }

  function toggleMember(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loadingMembers || saving) return;

    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();

    if (trimmedTitle.length < 3) {
      setError("Informe um título com pelo menos 3 caracteres.");
      return;
    }

    if (!trimmedMessage) {
      setError("Informe a mensagem da notificação.");
      return;
    }

    if (selectedIds.length === 0) {
      setError("Selecione ao menos um membro.");
      return;
    }

    const controller = new AbortController();
    setSaving(true);
    setError("");

    try {
      const created = await Promise.all(
        selectedIds.map((memberId) =>
          createNotices(controller.signal, {
            title: trimmedTitle,
            message: trimmedMessage,
            memberId,
            read: false,
            date: new Date().toISOString(),
          })
        )
      );
      onCreated?.(created);
      onClose();
    } catch (caught: unknown) {
      if (caught instanceof DOMException && caught.name === "AbortError") {
        return;
      }
      setError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível salvar a notificação."
      );
    } finally {
      setSaving(false);
    }
  }

  const submitLabel =
    selectedIds.length > 1
      ? `Enviar para ${selectedIds.length} membros`
      : "Enviar notificação";

  return {
    titleRef,
    title,
    setTitle,
    message,
    setMessage,
    selectedMembers,
    query,
    setQuery,
    handleSubmit,
    loadingMembers,
    visibleIds,
    allSelected,
    toggleAll,
    toggleMember,
    filteredMembers,
    selectedIds,
    saving,
    displayedError,
    submitLabel
  };
}
