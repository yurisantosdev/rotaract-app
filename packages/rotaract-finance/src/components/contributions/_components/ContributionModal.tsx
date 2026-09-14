"use client";

import { FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import {
  CalendarBlankIcon,
  CheckIcon,
  CurrencyCircleDollarIcon,
  MagnifyingGlassIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import {
  AlertError,
  AlertSuccess,
  Button,
  DatePicker,
  Modal,
} from "@rotaract/components";
import { MemberAvatar, useMembers, useMembersError, useMembersStatus } from "@rotaract/members";
import { listSettings } from "@rotaract/settings";
import {
  formatBRL,
  formatMoneyFromNumber,
  formatMoneyInput,
  parseMoneyInput,
} from "../../../services/money.services";
import {
  dueDateForReference,
  isISODate,
  MONTHS,
  type Contribution,
  type GenerateContributionsPayload,
} from "../../../types/contributions";

const FIELD_CLASS =
  "h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none ring-rotaract-pink/20 transition placeholder:text-zinc-400 focus:border-rotaract-pink/50 focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60";

function FormSection({
  icon,
  title,
  description,
  action,
  children,
  className,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-3xl border border-zinc-200/80 bg-zinc-50/80 p-4 ${className ?? ""}`.trim()}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-rotaract-pink shadow-[0_1px_2px_rgba(24,24,27,0.06)] ring-1 ring-zinc-200/80">
            {icon}
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
            <p className="mt-0.5 text-xs leading-5 text-zinc-500">{description}</p>
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

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

function referenceFieldId(reference: string): string {
  return `contribution-due-${normalizeSearch(reference).replace(/\//g, "-")}`;
}

const MONTHS_SHORT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
] as const;

function shortReference(reference: string): string {
  const [monthName, yearRaw] = reference.split("/");
  const index = MONTHS.indexOf(monthName?.trim() ?? "");
  if (index < 0) return reference;
  return `${MONTHS_SHORT[index]}/${yearRaw}`;
}

function datesForReferences(
  items: string[],
  current: Record<string, string> = {}
): Record<string, string> {
  return Object.fromEntries(
    items.map((item) => [item, current[item] || dueDateForReference(item)])
  );
}

type ContributionModalProps = {
  open: boolean;
  contributions: Contribution[];
  onClose: () => void;
  onGenerate: (payload: GenerateContributionsPayload) => void | Promise<void>;
};

export function ContributionModal({
  open,
  contributions,
  onClose,
  onGenerate,
}: ContributionModalProps) {
  const references = useMemo(() => remainingReferences(), []);
  const members = useMembers();
  const membersStatus = useMembersStatus();
  const membersError = useMembersError();
  const loadingMembers = membersStatus === "idle" || membersStatus === "loading";
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedReferences, setSelectedReferences] = useState<string[]>(
    references[0] ? [references[0]] : []
  );
  const [dueDates, setDueDates] = useState<Record<string, string>>(() =>
    datesForReferences(references[0] ? [references[0]] : [])
  );
  const [query, setQuery] = useState("");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    const nextReferences = remainingReferences();
    const initialReferences = nextReferences[0] ? [nextReferences[0]] : [];
    setError("");
    setQuery("");
    setSelectedIds([]);
    setValue("");
    setSelectedReferences(initialReferences);
    setDueDates(datesForReferences(initialReferences));

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

  const displayedError =
    error ||
    (membersStatus === "failed"
      ? membersError ?? "Não foi possível carregar os membros."
      : "");

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
  const orderedSelectedReferences = references.filter((item) =>
    selectedReferences.includes(item)
  );
  const parsedValue = parseMoneyInput(value);
  const hasValue = Number.isFinite(parsedValue) && parsedValue > 0;
  const newChargeCount = selectedMembers.reduce((total, member) => {
    return (
      total +
      selectedReferences.filter(
        (item) => !existingKeys.has(`${member.id}::${item}`)
      ).length
    );
  }, 0);
  const previewTotal = hasValue ? parsedValue * newChargeCount : 0;
  const perMemberTotal =
    hasValue && orderedSelectedReferences.length > 0
      ? parsedValue * orderedSelectedReferences.length
      : 0;

  function toggleAll() {
    setSelectedIds((current) => {
      if (allSelected) {
        return current.filter((id) => !visibleSelectableIds.includes(id));
      }
      return Array.from(new Set([...current, ...visibleSelectableIds]));
    });
  }

  function toggleAllReferences() {
    if (allReferencesSelected) {
      setSelectedReferences([]);
      setDueDates({});
      return;
    }

    setSelectedReferences(references);
    setDueDates((current) => datesForReferences(references, current));
  }

  function toggleReference(item: string) {
    const selected = selectedReferences.includes(item);
    setSelectedReferences((current) =>
      selected ? current.filter((value) => value !== item) : [...current, item]
    );
    setDueDates((current) => {
      if (selected) {
        const next = { ...current };
        delete next[item];
        return next;
      }

      return {
        ...current,
        [item]: current[item] || dueDateForReference(item),
      };
    });
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

    const payloadReferences = selectedReferences.map((item) => ({
      reference: item,
      date: dueDates[item] ?? "",
    }));

    if (payloadReferences.length === 0) {
      setError("Selecione ao menos uma referência.");
      return;
    }

    if (payloadReferences.some((item) => !isISODate(item.date))) {
      setError("Informe a data de vencimento de cada referência.");
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
        references: payloadReferences,
        value: parsedValue,
      });
      AlertSuccess("Mensalidades geradas com sucesso");
      onClose();
    } catch {
      AlertError("Não foi possível gerar as mensalidades.");
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
      description="Escolha os meses, o valor e os membros. Combinações já existentes não serão duplicadas."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="flex max-h-[min(82vh,46rem)] flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid items-start gap-4 md:grid-cols-2">
            <div className="grid gap-4">
              <FormSection
                icon={<CalendarBlankIcon className="h-4 w-4" weight="bold" />}
                title="Período"
                description="Marque os meses e ajuste o vencimento de cada um."
                action={
                  <button
                    type="button"
                    onClick={toggleAllReferences}
                    className="shrink-0 text-xs font-semibold text-rotaract-pink transition hover:text-rotaract-magenta"
                  >
                    {allReferencesSelected ? "Limpar" : "Todos"}
                  </button>
                }
              >
                <div className="flex flex-wrap gap-2">
                  {references.map((item) => {
                    const selected = selectedReferences.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleReference(item)}
                        className={`h-9 rounded-full px-3 text-sm font-medium transition ${
                          selected
                            ? "bg-rotaract-pink text-white"
                            : "border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
                        }`}
                      >
                        {shortReference(item)}
                      </button>
                    );
                  })}
                </div>

                {orderedSelectedReferences.length > 0 ? (
                  <ul className="mt-3 grid gap-2">
                    {orderedSelectedReferences.map((item) => {
                      const fieldId = referenceFieldId(item);
                      const defaultDate = dueDateForReference(item);
                      return (
                        <li
                          key={item}
                          className="rounded-2xl bg-white p-3 ring-1 ring-zinc-200/80"
                        >
                          <label htmlFor={fieldId} className="mb-1.5 block min-w-0">
                            <span className="block truncate text-sm font-medium text-zinc-900">
                              {item}
                            </span>
                            <span className="block text-xs text-zinc-500">
                              Vencimento
                            </span>
                          </label>
                          <DatePicker
                            id={fieldId}
                            value={dueDates[item] ?? ""}
                            onChange={(nextDate) =>
                              setDueDates((current) => ({
                                ...current,
                                [item]: nextDate,
                              }))
                            }
                            baseDate={defaultDate}
                            fixedPopover
                            allowClear={false}
                          />
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-3 rounded-2xl border border-dashed border-zinc-200 bg-white/70 px-3 py-4 text-center text-sm text-zinc-500">
                    Selecione ao menos um mês para definir os vencimentos.
                  </p>
                )}
              </FormSection>

              <FormSection
                icon={<CurrencyCircleDollarIcon className="h-4 w-4" weight="bold" />}
                title="Valor"
                description="Mesmo valor para todas as referências selecionadas."
              >
                <label className="block">
                  <span className="sr-only">Valor da mensalidade</span>
                  <span className="relative block">
                    <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-zinc-400">
                      R$
                    </span>
                    <input
                      inputMode="numeric"
                      autoComplete="off"
                      value={value}
                      onChange={(event) =>
                        setValue(formatMoneyInput(event.target.value))
                      }
                      className={`${FIELD_CLASS} pl-12 tabular-nums`}
                      placeholder="0,00"
                    />
                  </span>
                </label>
                {hasValue && orderedSelectedReferences.length > 0 ? (
                  <p className="mt-2 text-xs leading-5 text-zinc-500">
                    {orderedSelectedReferences.length}{" "}
                    {orderedSelectedReferences.length === 1 ? "mês" : "meses"} ×{" "}
                    {formatBRL(parsedValue)} ={" "}
                    <span className="font-medium text-zinc-700">
                      {formatBRL(perMemberTotal)}
                    </span>{" "}
                    por membro
                  </p>
                ) : null}
              </FormSection>
            </div>

            <FormSection
              icon={<UsersThreeIcon className="h-4 w-4" weight="bold" />}
              title="Membros"
              description={
                selectedMembers.length === 0
                  ? "Nenhum selecionado ainda"
                  : `${selectedMembers.length} ${selectedMembers.length === 1 ? "membro selecionado" : "membros selecionados"}`
              }
              action={
                <button
                  type="button"
                  onClick={toggleAll}
                  disabled={loadingMembers || visibleSelectableIds.length === 0}
                  className="shrink-0 text-xs font-semibold text-rotaract-pink transition hover:text-rotaract-magenta disabled:text-zinc-400"
                >
                  {allSelected ? "Limpar" : "Todos"}
                </button>
              }
              className="md:sticky md:top-0"
            >
              <div className="relative">
                <MagnifyingGlassIcon
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                  weight="bold"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.preventDefault();
                  }}
                  disabled={loadingMembers}
                  className={`${FIELD_CLASS} pl-11`}
                  placeholder="Pesquisar por nome, e-mail ou cargo"
                  autoComplete="off"
                />
              </div>

              <ul
                className="mt-3 max-h-88 divide-y divide-zinc-100 overflow-y-auto rounded-2xl border border-zinc-200 bg-white"
                aria-busy={loadingMembers || undefined}
              >
                {selectedReferences.length === 0 ? (
                  <li className="px-4 py-8 text-center text-sm text-zinc-500">
                    Escolha ao menos um mês para liberar a seleção de membros.
                  </li>
                ) : loadingMembers ? (
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
                    const selected = !generated && selectedIds.includes(member.id);
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
            </FormSection>
          </div>

          {displayedError ? (
            <p
              className="mt-4 rounded-2xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600"
              role="alert"
            >
              {displayedError}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-zinc-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-zinc-500">
            {newChargeCount > 0 ? (
              <>
                <span className="font-semibold text-zinc-900">
                  {newChargeCount}{" "}
                  {newChargeCount === 1 ? "cobrança" : "cobranças"}
                </span>
                {previewTotal > 0 ? ` · ${formatBRL(previewTotal)} no total` : null}
              </>
            ) : (
              "Selecione meses e membros para gerar"
            )}
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-11 rounded-full px-5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              loading={saving}
              disabled={saving || loadingMembers}
              className="sm:min-w-44"
              title={saving ? "Gerando..." : "Gerar mensalidades"}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
