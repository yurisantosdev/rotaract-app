"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CheckIcon } from "@phosphor-icons/react";
import { Modal } from "@rotaract/components";
import { MemberAvatar } from "@rotaract/members";
import { listSettings } from "@rotaract/settings";
import { formatMoneyFromNumber, formatMoneyInput, parseMoneyInput } from "../../services/money";
import { listMembers, type Member } from "../../services/members";
import { inputClassName } from "../../types/movement";
import { MONTHS, type Contribution } from "../../types/contributions";

function remainingReferences(now = new Date()): string[] {
  const year = now.getFullYear();
  return MONTHS.slice(now.getMonth()).map((month) => `${month}/${year}`);
}

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

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
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);

  useEffect(() => {
    if (!open) {
      setLoadingMembers(true);
      return;
    }

    const controller = new AbortController();
    const nextReferences = remainingReferences();
    setError("");
    setQuery("");
    setSelectedIds([]);
    setValue("");
    setLoadingMembers(true);
    setSelectedReferences(nextReferences[0] ? [nextReferences[0]] : []);

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

    listSettings(controller.signal)
      .then((items) => {
        const fee = items[0]?.valueContribution;
        setValue(
          formatMoneyFromNumber(
            typeof fee === "number" && Number.isFinite(fee) && fee > 0 ? fee : 100
          )
        );
      })
      .catch((caught: unknown) => {
        if (caught instanceof DOMException && caught.name === "AbortError") {
          return;
        }
        setValue(formatMoneyFromNumber(100));
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
      const role = normalizeSearch(member.role);
      return name.includes(term) || email.includes(term) || role.includes(term);
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
  const selectedMembers = members.filter(
    (member) =>
      selectedIds.includes(member.id) && selectableIds.includes(member.id)
  );

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
    if (loadingMembers || saving) return;

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
      <form onSubmit={handleSubmit} className="max-h-[min(72vh,40rem)] overflow-y-auto px-5 py-5 sm:px-6">
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
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm text-zinc-600">Membros</p>
              <p className="mt-0.5 text-xs text-zinc-400">
                {selectedMembers.length === 0
                  ? "Nenhum selecionado ainda"
                  : `${selectedMembers.length} ${selectedMembers.length === 1 ? "membro" : "membros"}`}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleAll}
              disabled={loadingMembers || visibleSelectableIds.length === 0}
              className="text-sm font-medium text-rotaract-pink transition hover:text-rotaract-magenta disabled:text-zinc-400"
            >
              {allSelected ? "Limpar seleção" : "Selecionar todos"}
            </button>
          </div>

          {selectedMembers.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedMembers.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => toggleMember(member.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white py-1 pl-1 pr-3 text-xs font-medium text-zinc-700 transition hover:border-rose-200 hover:text-rose-600"
                >
                  <MemberAvatar member={member} size="xs" />
                  {member.name.split(" ")[0]}
                </button>
              ))}
            </div>
          ) : null}

          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.preventDefault();
            }}
            disabled={loadingMembers}
            className={`${inputClassName} mt-3`}
            placeholder="Buscar por nome ou cargo"
            autoComplete="off"
          />
          <ul
            className="mt-3 max-h-56 divide-y divide-zinc-100 overflow-y-auto rounded-2xl border border-zinc-200"
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
                const missing = selectedReferences.filter(
                  (item) => !existingKeys.has(`${member.id}::${item}`)
                );
                const generated =
                  selectedReferences.length > 0 && missing.length === 0;
                const selected =
                  !generated && selectedIds.includes(member.id);
                return (
                  <li key={member.id}>
                    <button
                      type="button"
                      disabled={generated}
                      onClick={() => toggleMember(member.id)}
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${
                        generated
                          ? "cursor-not-allowed bg-zinc-50"
                          : selected
                            ? "bg-rotaract-pink/5"
                            : "hover:bg-zinc-50"
                      }`}
                    >
                      <MemberAvatar member={member} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block truncate text-sm font-medium ${
                            generated ? "text-zinc-400" : "text-zinc-900"
                          }`}
                        >
                          {member.name}
                        </span>
                        <span
                          className={`block truncate text-xs ${
                            generated ? "text-zinc-400" : "text-zinc-500"
                          }`}
                        >
                          {generated
                            ? "Já gerada para as referências selecionadas"
                            : member.role}
                        </span>
                      </span>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          generated
                            ? "border-zinc-200 bg-zinc-100 text-zinc-300"
                            : selected
                              ? "border-rotaract-pink bg-rotaract-pink text-white"
                              : "border-zinc-300 bg-white"
                        }`}
                      >
                        {generated || selected ? (
                          <CheckIcon className="h-3 w-3" weight="bold" />
                        ) : null}
                      </span>
                    </button>
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
            disabled={saving || loadingMembers}
            className="h-12 rounded-full bg-rotaract-pink px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(255,45,122,0.28)] transition hover:bg-rotaract-magenta disabled:opacity-60"
          >
            {saving ? "Gerando..." : "Gerar mensalidades"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
