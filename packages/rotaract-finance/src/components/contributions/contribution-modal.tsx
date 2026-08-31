"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Modal } from "@rotaract/components";
import { formatMoneyFromNumber, formatMoneyInput, parseMoneyInput } from "../../services/money";
import { listMembers, type Member } from "../../services/members";
import { inputClassName } from "../../types/movement";
import { MONTHS, type Contribution } from "../../types/contributions";

function remainingReferences(now = new Date()): string[] {
  const year = now.getFullYear();
  return MONTHS.slice(now.getMonth()).map((month) => `${month}/${year}`);
}

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

const DEFAULT_VALUE = formatMoneyFromNumber(100);

type ContributionModalProps = {
  open: boolean;
  contributions: Contribution[];
  onClose: () => void;
  onGenerate: (payload: {
    memberIds: string[];
    references: string[];
    value: number;
  }) => void | Promise<void>;
};

export function ContributionModal({
  open,
  contributions,
  onClose,
  onGenerate,
}: ContributionModalProps) {
  const references = useMemo(() => remainingReferences(), []);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedReferences, setSelectedReferences] = useState<string[]>(
    references[0] ? [references[0]] : []
  );
  const [query, setQuery] = useState("");
  const [value, setValue] = useState(DEFAULT_VALUE);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    const nextReferences = remainingReferences();
    setError("");
    setQuery("");
    setSelectedIds([]);
    setValue(DEFAULT_VALUE);
    setSelectedReferences(nextReferences[0] ? [nextReferences[0]] : []);

    listMembers(controller.signal)
      .then(setMembers)
      .catch((caught: unknown) => {
        if (caught instanceof DOMException && caught.name === "AbortError") {
          return;
        }
        setMembers([]);
        setError("Não foi possível carregar os membros.");
      });

    return () => controller.abort();
  }, [open]);

  const existingKeys = useMemo(() => {
    return new Set(
      contributions.map((item) => `${item.memberId}::${item.reference}`)
    );
  }, [contributions]);

  const filteredMembers = useMemo(() => {
    const term = normalizeSearch(query);
    if (!term) return members;

    return members.filter((member) => {
      const name = normalizeSearch(member.name);
      const email = normalizeSearch(member.email ?? "");
      return name.includes(term) || email.includes(term);
    });
  }, [members, query]);

  const selectableIds = members
    .filter((member) =>
      selectedReferences.some(
        (item) => !existingKeys.has(`${member.id}::${item}`)
      )
    )
    .map((member) => member.id);
  const visibleSelectableIds = filteredMembers
    .filter((member) => selectableIds.includes(member.id))
    .map((member) => member.id);
  const allSelected =
    visibleSelectableIds.length > 0 &&
    visibleSelectableIds.every((id) => selectedIds.includes(id));
  const allReferencesSelected =
    references.length > 0 &&
    references.every((item) => selectedReferences.includes(item));

  function toggleAll() {
    setSelectedIds((current) => {
      if (allSelected) {
        return current.filter((id) => !visibleSelectableIds.includes(id));
      }
      return Array.from(new Set([...current, ...visibleSelectableIds]));
    });
  }

  function toggleAllReferences() {
    setSelectedReferences(allReferencesSelected ? [] : references);
  }

  function toggleReference(item: string) {
    setSelectedReferences((current) =>
      current.includes(item)
        ? current.filter((value) => value !== item)
        : [...current, item]
    );
  }

  function toggleMember(id: string) {
    if (!selectableIds.includes(id)) return;
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedValue = parseMoneyInput(value);

    if (selectedReferences.length === 0) {
      setError("Selecione ao menos uma referência.");
      return;
    }

    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      setError("Informe um valor maior que zero.");
      return;
    }

    const memberIds = selectedIds.filter((id) => selectableIds.includes(id));
    if (memberIds.length === 0) {
      setError("Selecione ao menos um membro.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onGenerate({
        memberIds,
        references: selectedReferences,
        value: parsedValue,
      });
      onClose();
    } catch {
      setError("Não foi possível gerar as mensalidades.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Tesouraria"
      title="Gerar mensalidades"
      description="Escolha as referências, o valor e os membros. Combinações que já existirem não serão duplicadas."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="px-5 py-5 sm:px-6">
        <div className="grid gap-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm text-zinc-600">Referência</span>
              <button
                type="button"
                onClick={toggleAllReferences}
                className="text-sm font-medium text-rotaract-pink transition hover:text-rotaract-magenta"
              >
                {allReferencesSelected ? "Limpar meses" : "Todos os meses"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {references.map((item) => {
                const selected = selectedReferences.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleReference(item)}
                    className={`h-10 rounded-full px-3 text-sm font-medium transition ${selected
                      ? "bg-rotaract-pink text-white"
                      : "border border-zinc-200 bg-zinc-50 text-zinc-600 hover:text-zinc-900"
                      }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
          <label>
            <span className="mb-1.5 block text-sm text-zinc-600">Valor</span>
            <span className="relative block">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-zinc-400">
                R$
              </span>
              <input
                inputMode="numeric"
                autoComplete="off"
                value={value}
                onChange={(event) => setValue(formatMoneyInput(event.target.value))}
                className={`${inputClassName} pl-12 tabular-nums`}
                placeholder="0,00"
              />
            </span>
          </label>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-zinc-600">Membros</span>
            <button
              type="button"
              onClick={toggleAll}
              disabled={visibleSelectableIds.length === 0}
              className="text-sm font-medium text-rotaract-pink transition hover:text-rotaract-magenta disabled:text-zinc-400"
            >
              {allSelected ? "Limpar seleção" : "Selecionar todos"}
            </button>
          </div>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.preventDefault();
            }}
            className={`${inputClassName} mb-2`}
            placeholder="Buscar por nome ou e-mail"
            autoComplete="off"
          />
          <ul className="max-h-56 overflow-y-auto rounded-2xl border border-zinc-200 divide-y divide-zinc-100">
            {filteredMembers.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-zinc-500">
                Nenhum membro encontrado.
              </li>
            ) : (
              filteredMembers.map((member) => {
                const missing = selectedReferences.filter(
                  (item) => !existingKeys.has(`${member.id}::${item}`)
                );
                const generated = selectedReferences.length > 0 && missing.length === 0;
                const checked = generated || selectedIds.includes(member.id);
                return (
                  <li key={member.id}>
                    <label
                      className={`flex cursor-pointer items-center gap-3 px-4 py-3 text-sm ${generated ? "cursor-not-allowed bg-zinc-50 text-zinc-400" : "text-zinc-800 hover:bg-zinc-50"}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={generated}
                        onChange={() => toggleMember(member.id)}
                        className="h-4 w-4 rounded border-zinc-300 text-rotaract-pink focus:ring-rotaract-pink/30"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">
                          {shortName(member.name)}
                        </span>
                        {generated ? (
                          <span className="block text-xs text-zinc-400">
                            Já gerada para as referências selecionadas
                          </span>
                        ) : member.email ? (
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
            className="h-12 rounded-full px-5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="h-12 rounded-full bg-rotaract-pink px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(255,45,122,0.28)] transition hover:bg-rotaract-magenta disabled:opacity-60"
          >
            {saving ? "Gerando..." : "Gerar mensalidades"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
