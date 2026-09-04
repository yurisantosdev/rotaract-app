"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { CheckCircleIcon, ArrowCounterClockwiseIcon, HandshakeIcon, TrashIcon } from "@phosphor-icons/react";
import { ConfirmModal, Tooltip } from "@rotaract/components";
import { formatBRL } from "../../services/money";
import { Contribution, ContributionStatus, MONTHS } from "../../types/contributions";
import { inputClassName } from "../../types/movement";
import { downloadContributionsReport } from "../../services/report";
import { ContributionModal } from "./contribution-modal";
import { TextContributions } from "./TextContribution";
import { ButtonsExcelGenerate } from "./ButtonsExcelGenerate";
import { StatusContribution } from "./StatusContribution";

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function compareReferences(a: string, b: string): number {
  const [monthA, yearA] = a.split("/");
  const [monthB, yearB] = b.split("/");
  const yearDiff = Number(yearB) - Number(yearA);
  if (yearDiff !== 0) return yearDiff;
  return MONTHS.indexOf(monthB ?? "") - MONTHS.indexOf(monthA ?? "");
}

type ContributionsPanelProps = {
  contributions: Contribution[];
  onToggle: (ids: string[]) => void | Promise<void>;
  onExempt: (ids: string[]) => void | Promise<void>;
  onRemove: (ids: string[]) => void | Promise<void>;
  onGenerate: (payload: {
    memberIds: string[];
    references: string[];
    value: number;
  }) => void | Promise<void>;
};

type BusyKind = "pay" | "pending" | "exempt" | "remove";
type BusyState = {
  ids: string[];
  kind: BusyKind;
  scope: "row" | "bulk";
};

const checkboxClassName =
  "h-4 w-4 rounded border-zinc-300 text-rotaract-pink focus:ring-rotaract-pink/30";

function iconButtonClassName(
  hover: string,
  disabled: boolean,
  loading: boolean
): string {
  if (loading) {
    return "rounded-full p-1.5 text-sm text-zinc-500 transition cursor-wait";
  }

  return `rounded-full p-1.5 text-sm text-zinc-500 transition ${disabled
    ? "cursor-not-allowed opacity-40"
    : hover
    }`;
}

function ActionButton({
  label,
  disabled,
  loading,
  hover,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  loading?: boolean;
  hover: string;
  onClick: () => void;
  children: ReactNode;
}) {
  const isLoading = Boolean(loading);

  return (
    <Tooltip label={isLoading ? "Carregando..." : label}>
      <button
        type="button"
        aria-label={isLoading ? "Carregando" : label}
        aria-busy={isLoading || undefined}
        disabled={Boolean(disabled) || isLoading}
        onClick={onClick}
        className={iconButtonClassName(hover, Boolean(disabled), isLoading)}
      >
        {isLoading ? (
          <span
            className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-zinc-200 border-t-rotaract-pink motion-reduce:animate-none"
            aria-hidden
          />
        ) : (
          children
        )}
      </button>
    </Tooltip>
  );
}

export function ContributionsPanel({
  contributions,
  onToggle,
  onExempt,
  onRemove,
  onGenerate,
}: ContributionsPanelProps) {
  const [statusFilter, setStatusFilter] = useState<"todos" | ContributionStatus>(
    "todos"
  );
  const [query, setQuery] = useState("");
  const [referenceFilter, setReferenceFilter] = useState("todos");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [busy, setBusy] = useState<BusyState | null>(null);
  const busyRef = useRef(false);

  const references = useMemo(
    () =>
      Array.from(new Set(contributions.map((item) => item.reference))).sort(
        compareReferences
      ),
    [contributions]
  );

  const activeReference =
    referenceFilter !== "todos" && references.includes(referenceFilter)
      ? referenceFilter
      : "todos";

  const filtered = useMemo(() => {
    const term = normalizeSearch(query);
    return contributions.filter((item) => {
      if (statusFilter !== "todos" && item.status !== statusFilter) return false;
      if (activeReference !== "todos" && item.reference !== activeReference) {
        return false;
      }
      if (term && !normalizeSearch(item.name).includes(term)) return false;
      return true;
    });
  }, [activeReference, contributions, query, statusFilter]);

  const visibleSelected = useMemo(() => {
    const visible = new Set(filtered.map((item) => item.id));
    return selectedIds.filter((id) => visible.has(id));
  }, [filtered, selectedIds]);

  const selectedItems = useMemo(
    () => filtered.filter((item) => visibleSelected.includes(item.id)),
    [filtered, visibleSelected]
  );

  const hasSelection = visibleSelected.length > 0;
  const allVisibleSelected =
    filtered.length > 0 && visibleSelected.length === filtered.length;
  const pendingSelected = selectedItems.filter((item) => item.status === "pendente");
  const revertSelected = selectedItems.filter((item) => item.status !== "pendente");
  const exemptableSelected = selectedItems.filter((item) => item.status !== "isento");

  const pendingCount = contributions.filter((item) => item.status === "pendente").length;
  const received = contributions
    .filter((item) => item.status === "pago")
    .reduce((sum, item) => sum + item.value, 0);

  const deleteTarget =
    deleteIds.length === 1
      ? contributions.find((item) => item.id === deleteIds[0])
      : undefined;

  function setFilter(value: "todos" | ContributionStatus) {
    setStatusFilter(value);
    setSelectedIds([]);
  }

  function setReference(value: string) {
    setReferenceFilter(value);
    setSelectedIds([]);
  }

  function toggleAll() {
    setSelectedIds(allVisibleSelected ? [] : filtered.map((item) => item.id));
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  const isBusy = busy !== null;
  const isRemoving = busy?.kind === "remove";

  async function runAction(
    ids: string[],
    kind: BusyKind,
    scope: "row" | "bulk",
    action: (ids: string[]) => void | Promise<void>
  ) {
    if (ids.length === 0 || busyRef.current) return;

    busyRef.current = true;
    setBusy({ ids, kind, scope });
    try {
      await action(ids);
      if (scope === "bulk") setSelectedIds([]);
    } finally {
      busyRef.current = false;
      setBusy(null);
    }
  }

  function isActionLoading(
    kind: BusyKind,
    scope: "row" | "bulk",
    id?: string
  ): boolean {
    if (!busy || busy.kind !== kind || busy.scope !== scope) return false;
    return id ? busy.ids.includes(id) : true;
  }

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-[0_12px_40px_rgba(24,24,27,0.04)] sm:p-6">
      <div className="flex justify-between items-center gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Mensalidades</h2>
          <span className="md:flex hidden">
            <TextContributions pendingCount={pendingCount} received={received} />
          </span>
        </div>

        <ButtonsExcelGenerate
          onDownload={() => downloadContributionsReport(filtered)}
          onGenerate={() => setOpenModal(!openModal)}
        />
      </div>

      <span className="md:hidden flex mt-3">
        <TextContributions pendingCount={pendingCount} received={received} />
      </span>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelectedIds([]);
          }}
          className={inputClassName}
          placeholder="Buscar por nome"
          autoComplete="off"
        />

        <div className="flex rounded-full border border-zinc-200 bg-zinc-50 p-1">
          {(
            [
              ["todos", "Todos"],
              ["pendente", "Pendentes"],
              ["pago", "Pagos"],
              ["isento", "Isentos"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`h-9 rounded-full w-full px-3 text-sm font-medium transition ${statusFilter === value
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        <select
          value={activeReference}
          onChange={(event) => setReference(event.target.value)}
          className={`${inputClassName} sm:max-w-xs`}
          aria-label="Mês de referência"
        >
          <option value="todos">Todas as referências</option>
          {references.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <ContributionModal
        open={openModal}
        contributions={contributions}
        onClose={() => setOpenModal(false)}
        onGenerate={onGenerate}
      />

      <ConfirmModal
        open={deleteIds.length > 0}
        title={deleteIds.length > 1 ? "Excluir mensalidades" : "Excluir mensalidade"}
        description={
          deleteIds.length > 1
            ? `Deseja realmente excluir ${deleteIds.length} mensalidades? Esta ação não pode ser desfeita.`
            : deleteTarget
              ? `Deseja realmente excluir a mensalidade de “${deleteTarget.name}”? Esta ação não pode ser desfeita.`
              : undefined
        }
        confirmLabel={isRemoving ? "Excluindo..." : "Excluir"}
        loading={isRemoving}
        onClose={() => {
          if (isRemoving) return;
          setDeleteIds([]);
        }}
        onConfirm={() => {
          void runAction(
            deleteIds,
            "remove",
            deleteIds.length > 1 ? "bulk" : "row",
            async (ids) => {
              await onRemove(ids);
              setSelectedIds((current) =>
                current.filter((id) => !ids.includes(id))
              );
              setDeleteIds([]);
            }
          );
        }}
      />

      {filtered.length > 0 ? (
        <div className="flex justify-between items-center gap-2 mt-5">
          <div>
            <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-600">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                disabled={isBusy}
                ref={(node) => {
                  if (node) {
                    node.indeterminate = hasSelection && !allVisibleSelected;
                  }
                }}
                onChange={toggleAll}
                className={checkboxClassName}
              />
              Selecionar todos
            </label>
          </div>

          <div>
            {hasSelection ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-500">
                  {visibleSelected.length} selecionada
                  {visibleSelected.length === 1 ? "" : "s"}
                </span>
                <ActionButton
                  label="Confirmar pagamento"
                  disabled={pendingSelected.length === 0 || isBusy}
                  loading={isActionLoading("pay", "bulk")}
                  hover="hover:bg-emerald-50 hover:text-zinc-800"
                  onClick={() =>
                    void runAction(
                      pendingSelected.map((item) => item.id),
                      "pay",
                      "bulk",
                      onToggle
                    )
                  }
                >
                  <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                </ActionButton>
                <ActionButton
                  label="Marcar pendente"
                  disabled={revertSelected.length === 0 || isBusy}
                  loading={isActionLoading("pending", "bulk")}
                  hover="hover:bg-amber-50 hover:text-zinc-800"
                  onClick={() =>
                    void runAction(
                      revertSelected.map((item) => item.id),
                      "pending",
                      "bulk",
                      onToggle
                    )
                  }
                >
                  <ArrowCounterClockwiseIcon className="h-4 w-4 text-amber-600" />
                </ActionButton>
                <ActionButton
                  label="Isentar"
                  disabled={exemptableSelected.length === 0 || isBusy}
                  loading={isActionLoading("exempt", "bulk")}
                  hover="hover:bg-sky-50 hover:text-zinc-800"
                  onClick={() =>
                    void runAction(
                      exemptableSelected.map((item) => item.id),
                      "exempt",
                      "bulk",
                      onExempt
                    )
                  }
                >
                  <HandshakeIcon className="h-4 w-4 text-sky-600" />
                </ActionButton>
                <ActionButton
                  label="Excluir"
                  disabled={isBusy}
                  hover="hover:bg-rose-50 hover:text-zinc-800"
                  onClick={() => setDeleteIds(visibleSelected)}
                >
                  <TrashIcon className="h-4 w-4 text-red-500" />
                </ActionButton>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <ul className="mt-2 divide-y divide-zinc-100 max-h-[500px] overflow-y-auto">
        {filtered.length === 0 ? (
          <li className="py-10 text-center text-sm text-zinc-500">
            Nenhuma mensalidade encontrada com esses filtros.
          </li>
        ) : (
          filtered.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between mt-3"
              aria-busy={busy?.ids.includes(item.id) || undefined}
            >
              <label className="flex min-w-0 cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={visibleSelected.includes(item.id)}
                  disabled={isBusy}
                  onChange={() => toggleSelected(item.id)}
                  className={`${checkboxClassName} mt-1`}
                />
                <span>
                  <span className="block font-medium text-zinc-900">{item.name}</span>
                  <span className="mt-1 block text-sm text-zinc-500">
                    {item.reference} · {formatBRL(item.value)}
                  </span>
                </span>
              </label>
              <div className="flex items-center gap-3 md:justify-center justify-between md:ml-0 ml-4">
                <StatusContribution status={item} />

                <div className="flex gap-2 mr-4">
                  {item.status === "pendente" ? (
                    <ActionButton
                      label="Confirmar pagamento"
                      disabled={hasSelection || isBusy}
                      loading={isActionLoading("pay", "row", item.id)}
                      hover="hover:bg-emerald-50 hover:text-zinc-800"
                      onClick={() =>
                        void runAction([item.id], "pay", "row", onToggle)
                      }
                    >
                      <CheckCircleIcon className="h-4 w-4 text-emerald-600 group-hover/tooltip:text-emerald-700" />
                    </ActionButton>
                  ) : (
                    <ActionButton
                      label="Marcar pendente"
                      disabled={hasSelection || isBusy}
                      loading={isActionLoading("pending", "row", item.id)}
                      hover="hover:bg-amber-50 hover:text-zinc-800"
                      onClick={() =>
                        void runAction([item.id], "pending", "row", onToggle)
                      }
                    >
                      <ArrowCounterClockwiseIcon className="h-4 w-4 text-amber-600 group-hover/tooltip:text-amber-700" />
                    </ActionButton>
                  )}
                  {item.status !== "isento" ? (
                    <ActionButton
                      label="Isentar"
                      disabled={hasSelection || isBusy}
                      loading={isActionLoading("exempt", "row", item.id)}
                      hover="hover:bg-sky-50 hover:text-zinc-800"
                      onClick={() =>
                        void runAction([item.id], "exempt", "row", onExempt)
                      }
                    >
                      <HandshakeIcon className="h-4 w-4 text-sky-600 group-hover/tooltip:text-sky-700" />
                    </ActionButton>
                  ) : null}
                  <ActionButton
                    label="Excluir"
                    disabled={hasSelection || isBusy}
                    hover="hover:bg-rose-50 hover:text-zinc-800"
                    onClick={() => setDeleteIds([item.id])}
                  >
                    <TrashIcon className="h-4 w-4 text-red-500 group-hover/tooltip:text-red-600" />
                  </ActionButton>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
