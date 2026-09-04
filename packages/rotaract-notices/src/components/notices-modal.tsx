"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Button, Modal } from "@rotaract/components";
import { listMembers, type Member } from "../services/members";
import { createNotices } from "../services/notices";
import {
  NOTICE_INPUT_CLASS,
  NOTICE_TEXTAREA_CLASS,
  type Notices,
} from "../types/notices";

function shortName(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).join(" ");
}

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

type NoticesModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: (notices: Notices[]) => void;
};

export function NoticesModal({ open, onClose, onCreated }: NoticesModalProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);

  useEffect(() => {
    if (!open) {
      setLoadingMembers(true);
      return;
    }

    const controller = new AbortController();
    setTitle("");
    setMessage("");
    setQuery("");
    setSelectedIds([]);
    setError("");
    setSaving(false);
    setLoadingMembers(true);

    listMembers(controller.signal)
      .then((items) => {
        if (controller.signal.aborted) return;
        setMembers(items);
      })
      .catch((caught: unknown) => {
        if (caught instanceof DOMException && caught.name === "AbortError") {
          return;
        }
        setMembers([]);
        setError("Não foi possível carregar os membros.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingMembers(false);
        }
      });

    return () => controller.abort();
  }, [open]);

  const filteredMembers = useMemo(() => {
    const term = normalizeSearch(query);
    if (!term) return members;

    return members.filter((member) => {
      const name = normalizeSearch(member.name);
      const email = normalizeSearch(member.email ?? "");
      return name.includes(term) || email.includes(term);
    });
  }, [members, query]);

  const visibleIds = filteredMembers.map((member) => member.id);
  const allSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

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

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Notificações"
      title="Nova notificação"
      description="Escreva o recado e escolha os membros que devem receber."
      initialFocusRef={titleRef}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="px-5 py-5 sm:px-6">
        <label className="block">
          <span className="mb-1.5 block text-sm text-zinc-600">Título</span>
          <input
            ref={titleRef}
            value={title}
            onChange={(changeEvent) => setTitle(changeEvent.target.value)}
            className={NOTICE_INPUT_CLASS}
            placeholder="Ex.: Assembleia de setembro"
            maxLength={80}
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm text-zinc-600">Mensagem</span>
          <textarea
            value={message}
            onChange={(changeEvent) => setMessage(changeEvent.target.value)}
            className={NOTICE_TEXTAREA_CLASS}
            placeholder="Escreva o recado para os membros selecionados"
            maxLength={400}
          />
        </label>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-zinc-600">Membros</span>
            <button
              type="button"
              onClick={toggleAll}
              disabled={loadingMembers || visibleIds.length === 0}
              className="text-sm font-medium text-rotaract-pink transition hover:text-rotaract-magenta disabled:text-zinc-400"
            >
              {allSelected ? "Limpar seleção" : "Selecionar todos"}
            </button>
          </div>
          <input
            type="search"
            value={query}
            onChange={(changeEvent) => setQuery(changeEvent.target.value)}
            onKeyDown={(changeEvent) => {
              if (changeEvent.key === "Enter") changeEvent.preventDefault();
            }}
            disabled={loadingMembers}
            className={`${NOTICE_INPUT_CLASS} mb-2`}
            placeholder="Buscar por nome ou e-mail"
            autoComplete="off"
          />
          <ul
            className="max-h-56 overflow-y-auto rounded-2xl border border-zinc-200 divide-y divide-zinc-100"
            aria-busy={loadingMembers || undefined}
          >
            {loadingMembers ? (
              <li
                className="flex flex-col items-center justify-center gap-3 px-4 py-10"
                role="status"
                aria-live="polite"
              >
                <span
                  className="h-8 w-8 animate-spin rounded-full border-[3px] border-zinc-200 border-t-rotaract-pink motion-reduce:animate-none"
                  aria-hidden
                />
                <span className="text-sm font-medium text-zinc-600">
                  Carregando membros...
                </span>
              </li>
            ) : filteredMembers.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-zinc-500">
                Nenhum membro encontrado.
              </li>
            ) : (
              filteredMembers.map((member) => {
                const checked = selectedIds.includes(member.id);
                return (
                  <li key={member.id}>
                    <label className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm text-zinc-800 hover:bg-zinc-50">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleMember(member.id)}
                        className="h-4 w-4 rounded border-zinc-300 text-rotaract-pink focus:ring-rotaract-pink/30"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">
                          {shortName(member.name)}
                        </span>
                        {member.email ? (
                          <span className="block text-xs text-zinc-400">
                            {member.email}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        {error ? (
          <p className="mt-4 text-sm text-rose-500" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-12 rounded-full px-5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cancelar
          </button>
          <Button
            type="submit"
            loading={saving}
            disabled={saving || loadingMembers}
            title={saving ? "Enviando..." : submitLabel}
          />
        </div>
      </form>
    </Modal>
  );
}
