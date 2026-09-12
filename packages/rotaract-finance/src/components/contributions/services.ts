"use client";

import { ContributionStatus, MONTHS, isUnpaidContribution } from "../../types/contributions";
import { BusyKind, BusyState, UseContributionsProps } from "./types";
import { AlertSuccess, usePagination } from "@rotaract/components";
import { useMemo, useRef, useState } from "react";

export function useContributions({ contributions }: UseContributionsProps) {
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

  const filterFieldClassName =
    "h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-900 outline-none ring-rotaract-pink/20 transition placeholder:text-zinc-400 focus:border-rotaract-pink/50 focus:bg-white focus:ring-4";

  const STATUS_FILTERS: { id: "todos" | ContributionStatus; label: string }[] = [
    { id: "todos", label: "Todos" },
    { id: "pendente", label: "Pendentes" },
    { id: "vencido", label: "Vencidos" },
    { id: "pago", label: "Pagos" },
    { id: "isento", label: "Isentos" },
  ];

  const checkboxClassName =
    "h-4 w-4 rounded border-zinc-300 text-rotaract-pink focus:ring-rotaract-pink/30";

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

  const pagination = usePagination(filtered, {
    resetKey: `${query}|${statusFilter}|${activeReference}`,
  });

  const visibleSelected = useMemo(() => {
    const visible = new Set(filtered.map((item) => item.id));
    return selectedIds.filter((id) => visible.has(id));
  }, [filtered, selectedIds]);

  const selectedItems = useMemo(
    () => filtered.filter((item) => visibleSelected.includes(item.id)),
    [filtered, visibleSelected]
  );

  const hasSelection = visibleSelected.length > 0;
  const pageIds = useMemo(
    () => pagination.pageItems.map((item) => item.id),
    [pagination.pageItems]
  );
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
  const somePageSelected = pageIds.some((id) => selectedIds.includes(id));
  const pendingSelected = selectedItems.filter((item) =>
    isUnpaidContribution(item.status)
  );
  const revertSelected = selectedItems.filter(
    (item) => item.status === "pago" || item.status === "isento"
  );
  const exemptableSelected = selectedItems.filter((item) => item.status !== "isento");

  const pendingCount = contributions.filter((item) =>
    isUnpaidContribution(item.status)
  ).length;
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
    setSelectedIds((current) => {
      if (allPageSelected) {
        const pageSet = new Set(pageIds);
        return current.filter((id) => !pageSet.has(id));
      }
      return [...new Set([...current, ...pageIds])];
    });
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

      const plural = ids.length > 1;
      if (kind === "pay") {
        AlertSuccess(
          plural
            ? "Pagamentos confirmados com sucesso"
            : "Pagamento confirmado com sucesso"
        );
      } else if (kind === "pending") {
        AlertSuccess(
          plural
            ? "Mensalidades marcadas como pendentes"
            : "Mensalidade marcada como pendente"
        );
      } else if (kind === "exempt") {
        AlertSuccess(
          plural
            ? "Mensalidades isentas com sucesso"
            : "Mensalidade isenta com sucesso"
        );
      }
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


  return {
    pendingCount,
    received,
    deleteTarget,
    setFilter,
    setReference,
    toggleAll,
    toggleSelected,
    isBusy,
    isRemoving,
    runAction,
    isActionLoading,
    filtered,
    query,
    setQuery,
    selectedIds,
    setSelectedIds,
    filterFieldClassName,
    activeReference,
    references,
    statusFilter,
    setOpenModal,
    openModal,
    allPageSelected,
    somePageSelected,
    hasSelection,
    visibleSelected,
    pendingSelected,
    revertSelected,
    exemptableSelected,
    pagination,
    STATUS_FILTERS,
    deleteIds,
    setDeleteIds,
    checkboxClassName,
    busy,
  };
}
