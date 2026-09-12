"use client";

import { FormEvent, useMemo, useState } from "react";
import { AlertSuccess, Button, ButtonExcel, ConfirmModal, Pagination, Tooltip, usePagination } from "@rotaract/components";
import { formatBRL, formatDate, formatMoneyFromNumber, parseMoneyInput, todayISO } from "../../services/money.services";
import { MovementModal } from "./_components/movement-modal";
import {
  MOVEMENT_CATEGORIES,
  inputClassName,
  type Movement,
  type MovementType,
} from "../../types/movement";
import { TrashIcon, PencilSimpleIcon, PlusIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { downloadMovementsReport } from "../../services/report.services";
import { ImportMovementsModal } from "./_components/import-movements-modal";
import { MovementsPanelProps } from "./types";
import { useMovements } from "./services";

export function MovementsPanel({
  movements,
  onAdd,
  onUpdate,
  onRemove,
  onImported,
}: MovementsPanelProps) {
  const data = useMovements({ movements, onUpdate, onAdd });
  if (!data) return null;
  const {
    filtered,
    setImportOpen,
    openCreate,
    importOpen,
    formOpen,
    editingMovement,
    description,
    value,
    category,
    type,
    date,
    error,
    saving,
    movementToDelete,
    setDescription,
    setValue,
    setDate,
    setCategory,
    setType,
    closeForm,
    handleSubmit,
    setMovementToDelete,
    query,
    setQuery,
    setTypeFilter,
    typeFilter,
    pagination,
    openEdit,
  } = data;

  return (
    <section className="min-w-0 overflow-hidden rounded-3xl border border-zinc-200 bg-white p-4 shadow-[0_12px_40px_rgba(24,24,27,0.04)] sm:p-6">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-zinc-900">Movimentações</h2>
          <p className="mt-1 text-sm text-zinc-500 md:flex hidden">
            Filtre, registre e acompanhe entradas e saídas do clube.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <ButtonExcel
            onClick={() => downloadMovementsReport(filtered)}
          />

          <Tooltip label="Importar Excel">
            <button
              type="button"
              aria-label="Importar Excel"
              onClick={() => setImportOpen(true)}
              className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 p-3.5 text-emerald-700 transition hover:bg-emerald-100 cursor-pointer"
            >
              <UploadSimpleIcon className="h-5 w-5" weight="bold" />
            </button>
          </Tooltip>

          <Tooltip label="Nova movimentação">
            <Button
              aria-label="Nova movimentação"
              icon={<PlusIcon className="h-5 w-5" />}
              onClick={openCreate}
            />
          </Tooltip>
        </div>
      </div>

      <ImportMovementsModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={(created) => {
          onImported(created);
          AlertSuccess(
            created.length === 1
              ? "Movimentação importada com sucesso"
              : `${created.length} movimentações importadas com sucesso`
          );
        }}
      />

      <MovementModal
        open={formOpen}
        mode={editingMovement ? "edit" : "create"}
        description={description}
        value={value}
        date={date}
        category={category}
        type={type}
        error={error}
        saving={saving}
        onDescriptionChange={setDescription}
        onValueChange={setValue}
        onDateChange={setDate}
        onCategoryChange={setCategory}
        onTypeChange={setType}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        open={Boolean(movementToDelete)}
        title="Excluir movimentação"
        description={
          movementToDelete
            ? `Deseja realmente excluir “${movementToDelete.description}”? Esta ação não pode ser desfeita.`
            : undefined
        }
        confirmLabel="Excluir"
        onClose={() => setMovementToDelete(null)}
        onConfirm={() => {
          if (!movementToDelete) return;
          onRemove(movementToDelete.id);
          AlertSuccess("Movimentação excluída com sucesso");
          setMovementToDelete(null);
        }}
      />

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className={inputClassName}
          placeholder="Pesquisar..."
        />
        <div className="grid min-w-0 grid-cols-3 gap-1 rounded-full border border-zinc-200 bg-zinc-50 p-1 md:w-[30%] w-full">
          {(
            [
              ["todos", "Todos"],
              ["entrada", "Entradas"],
              ["saida", "Saídas"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTypeFilter(value)}
              className={`h-9 min-w-0 rounded-full px-2 text-xs font-medium transition sm:px-3 sm:text-sm ${typeFilter === value
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
                }`}
            >
              <span className="block truncate">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-5 divide-y divide-zinc-100">
        {filtered.length === 0 ? (
          <li className="py-10 text-center text-sm text-zinc-500">
            Nenhuma movimentação encontrada com esses filtros.
          </li>
        ) : (
          pagination.pageItems.map((movement) => (
            <li
              key={movement.id}
              className="overflow-x-hidden"
            >
              <Tooltip label={movement.description}>
                <p className="truncate font-medium text-zinc-900 max-w-[150px]">
                  {movement.description}
                </p>
              </Tooltip>

              <div className="flex min-w-0 items-center justify-between gap-3 mr-4">
                <p className="mt-1 min-w-0 truncate text-sm text-zinc-500">
                  {formatDate(movement.date)} · {movement.category}
                </p>
                <span
                  className={`shrink-0 text-sm font-semibold ${movement.type === "entrada" ? "text-emerald-600" : "text-rose-500"
                    }`}
                >
                  {movement.type === "entrada" ? "+" : "−"}
                  {formatBRL(movement.value)}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 mr-4">
                <Tooltip label="Excluir">
                  <button
                    type="button"
                    aria-label="Excluir"
                    onClick={() => setMovementToDelete(movement)}
                    className="rounded-full p-1.5 text-sm text-zinc-500 transition hover:bg-rose-50 hover:text-zinc-800"
                  >
                    <TrashIcon className="h-4 w-4 text-red-500 group-hover/tooltip:text-red-600" />
                  </button>
                </Tooltip>

                <Tooltip label="Editar">
                  <button
                    type="button"
                    aria-label="Editar"
                    onClick={() => openEdit(movement)}
                    className="rounded-full p-1.5 text-sm text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
                  >
                    <PencilSimpleIcon className="h-4 w-4 text-zinc-500 group-hover/tooltip:text-zinc-700" />
                  </button>
                </Tooltip>
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
        itemLabel={{ singular: "movimentação", plural: "movimentações" }}
      />
    </section>
  );
}
