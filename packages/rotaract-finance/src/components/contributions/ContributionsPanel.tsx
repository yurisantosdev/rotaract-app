"use client";

import {
  ArrowCounterClockwiseIcon,
  CalendarBlankIcon,
  CaretDownIcon,
  CheckCircleIcon,
  HandshakeIcon,
  MagnifyingGlassIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { AlertSuccess, ConfirmModal, Pagination } from "@rotaract/components";
import { formatBRL, formatDate } from "../../services/money.services";
import { isUnpaidContribution } from "../../types/contributions";
import { downloadContributionsReport } from "../../services/report.services";
import { ContributionModal } from "./_components/ContributionModal";
import { TextContributions } from "./_components/TextContribution";
import { ButtonsExcelGenerate } from "./_components/ButtonsExcelGenerate";
import { StatusContribution } from "./_components/StatusContribution";
import { ContributionsPanelProps } from "./types";
import { ActionButton } from "./_components/ActionButton";
import { useContributions } from "./services";

export function ContributionsPanel({
  contributions,
  onToggle,
  onExempt,
  onRemove,
  onGenerate,
}: ContributionsPanelProps) {
  const data = useContributions({ contributions });
  if (!data) return null;
  const {
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
  } = data;

  return (
    <section className="min-w-0 overflow-hidden rounded-3xl border border-zinc-200 bg-white p-4 shadow-[0_12px_40px_rgba(24,24,27,0.04)] sm:p-6">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
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

      <div className="mt-5 flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Pesquisar membro</span>
            <MagnifyingGlassIcon
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelectedIds([]);
              }}
              className={`${filterFieldClassName} pl-11`}
              placeholder="Pesquisar membro..."
              autoComplete="off"
            />
          </label>

          <label className="relative w-full sm:w-56 sm:shrink-0">
            <span className="sr-only">Mês de referência</span>
            <CalendarBlankIcon
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              aria-hidden
            />
            <select
              value={activeReference}
              onChange={(event) => setReference(event.target.value)}
              className={`${filterFieldClassName} cursor-pointer appearance-none truncate pl-11 pr-10`}
              aria-label="Mês de referência"
            >
              <option value="todos">Todas as referências</option>
              {references.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <CaretDownIcon
              className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400"
              weight="bold"
              aria-hidden
            />
          </label>
        </div>

        <div
          role="tablist"
          aria-label="Status da mensalidade"
          className="flex overflow-x-auto rounded-full border border-zinc-200 bg-zinc-50 p-1"
        >
          {STATUS_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={statusFilter === item.id}
              onClick={() => setFilter(item.id)}
              className={`h-9 min-w-0 flex-1 shrink-0 rounded-full px-2 text-xs font-medium transition sm:px-3 sm:text-sm ${statusFilter === item.id
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
                }`}
            >
              <span className="block truncate">{item.label}</span>
            </button>
          ))}
        </div>
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
              AlertSuccess(deleteIds.length > 1 ? "Mensalidades excluídas com sucesso" : "Mensalidade excluída com sucesso");
              setDeleteIds([]);
            }
          );
        }}
      />

      {filtered.length > 0 ? (
        <div className="mt-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-600">
              <input
                type="checkbox"
                checked={allPageSelected}
                disabled={isBusy}
                ref={(node) => {
                  if (node) {
                    node.indeterminate = somePageSelected && !allPageSelected;
                  }
                }}
                onChange={toggleAll}
                className={checkboxClassName}
              />
              Selecionar {pagination.totalPages > 1 ? "página" : "todos"}
            </label>
          </div>

          <div className="min-w-0">
            {hasSelection ? (
              <div className="flex flex-wrap items-center justify-end gap-2">
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
                  onClick={() => {
                    void runAction(
                      exemptableSelected.map((item) => item.id),
                      "exempt",
                      "bulk",
                      onExempt
                    )
                  }
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

      <ul className="mt-2 divide-y divide-zinc-100">
        {filtered.length === 0 ? (
          <li className="py-10 text-center text-sm text-zinc-500">
            Nenhuma mensalidade encontrada com esses filtros.
          </li>
        ) : (
          pagination.pageItems.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between mt-3 overflow-x-hidden"
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
                <span className="min-w-0">
                  <span className="block truncate font-medium text-zinc-900">{item.name}</span>
                  <span className="mt-1 block truncate text-sm text-zinc-500">
                    {item.reference} · {formatBRL(item.value)}
                    {item.date ? ` · vence ${formatDate(item.date)}` : ""}
                  </span>
                </span>
              </label>
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 sm:justify-end md:ml-0">
                <StatusContribution status={item} />

                <div className="flex shrink-0 gap-2">
                  {isUnpaidContribution(item.status) ? (
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

      <Pagination
        page={pagination.page}
        totalItems={pagination.totalItems}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setPage}
        itemLabel={{ singular: "mensalidade", plural: "mensalidades" }}
      />
    </section>
  );
}
