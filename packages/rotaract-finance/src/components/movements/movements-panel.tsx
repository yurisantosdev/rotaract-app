"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button, ConfirmModal, Tooltip } from "@rotaract/components";
import { formatBRL, formatDate, formatMoneyFromNumber, parseMoneyInput, todayISO } from "../../services/money";
import { MovementModal } from "./movement-modal";
import {
  MOVEMENT_CATEGORIES,
  inputClassName,
  type Movement,
  type MovementType,
} from "../../types/movement";
import { MicrosoftExcelLogoIcon, TrashIcon, PencilSimpleIcon, PlusIcon } from "@phosphor-icons/react";
import { downloadMovementsReport } from "../../services/report";

type MovementsPanelProps = {
  movements: Movement[];
  onAdd: (movement: Omit<Movement, "id">) => void | Promise<void>;
  onUpdate: (movement: Movement) => void | Promise<void>;
  onRemove: (id: string) => void;
};

export function MovementsPanel({
  movements,
  onAdd,
  onUpdate,
  onRemove,
}: MovementsPanelProps) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"todos" | MovementType>("todos");
  const [formOpen, setFormOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<Movement | null>(
    null
  );
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [category, setCategory] = useState<(typeof MOVEMENT_CATEGORIES)[number]>(
    "Doação"
  );
  const [type, setType] = useState<MovementType>("entrada");
  const [date, setDate] = useState(todayISO());
  const [error, setError] = useState("");
  const [movementToDelete, setMovementToDelete] = useState<Movement | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return movements
      .filter((movement) => {
        const matchesType = typeFilter === "todos" || movement.type === typeFilter;
        const matchesQuery =
          !normalizedQuery ||
          movement.description.toLowerCase().includes(normalizedQuery) ||
          movement.category.toLowerCase().includes(normalizedQuery);
        return matchesType && matchesQuery;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [movements, query, typeFilter]);

  function resetForm() {
    setDescription("");
    setValue("");
    setCategory("Doação");
    setType("entrada");
    setDate(todayISO());
    setError("");
  }

  function closeForm() {
    if (saving) return;
    setFormOpen(false);
    setEditingMovement(null);
    setError("");
  }

  function openCreate() {
    setEditingMovement(null);
    resetForm();
    setFormOpen(true);
  }

  function openEdit(movement: Movement) {
    const categoryValue = (MOVEMENT_CATEGORIES as readonly string[]).includes(
      movement.category
    )
      ? (movement.category as (typeof MOVEMENT_CATEGORIES)[number])
      : "Outros";

    setEditingMovement(movement);
    setDescription(movement.description);
    setValue(formatMoneyFromNumber(movement.value));
    setCategory(categoryValue);
    setType(movement.type);
    setDate(movement.date);
    setError("");
    setFormOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const parsedValue = parseMoneyInput(value);

    if (!description.trim()) {
      setError("Informe a descrição da movimentação.");
      return;
    }

    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      setError("Informe um valor maior que zero.");
      return;
    }

    const payload = {
      date,
      description: description.trim(),
      category,
      type,
      value: parsedValue,
    };

    setSaving(true);
    setError("");

    try {
      if (editingMovement) {
        await onUpdate({ ...payload, id: editingMovement.id });
      } else {
        await onAdd(payload);
      }

      setEditingMovement(null);
      resetForm();
      setFormOpen(false);
    } catch {
      setError(
        editingMovement
          ? "Não foi possível atualizar a movimentação."
          : "Não foi possível criar a movimentação."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-[0_12px_40px_rgba(24,24,27,0.04)] sm:p-6">
      <div className="flex justify-between items-center gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Movimentações</h2>
          <p className="mt-1 text-sm text-zinc-500 md:flex hidden">
            Filtre, registre e acompanhe entradas e saídas do clube.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tooltip label="Baixar relatório">
            <button
              type="button"
              aria-label="Baixar relatório"
              onClick={() => downloadMovementsReport(filtered)}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 p-3.5 transition hover:bg-emerald-600 cursor-pointer"
            >
              <MicrosoftExcelLogoIcon className="h-5 w-5" color="white" />
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
          setMovementToDelete(null);
        }}
      />

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className={inputClassName}
          placeholder="Buscar por descrição ou categoria"
        />
        <div className="flex rounded-full border border-zinc-200 bg-zinc-50 p-1">
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
              className={`h-9 rounded-full px-3 w-full text-sm font-medium transition ${typeFilter === value
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-5 divide-y divide-zinc-100 max-h-[500px] overflow-y-auto">
        {filtered.length === 0 ? (
          <li className="py-10 text-center text-sm text-zinc-500">
            Nenhuma movimentação encontrada com esses filtros.
          </li>
        ) : (
          filtered.map((movement) => (
            <li
              key={movement.id}
            >
              <p
                className="font-medium text-zinc-900">
                {movement.description}
              </p>

              <div className="flex justify-between items-center gap-3">
                <p className="mt-1 text-sm text-zinc-500">
                  {formatDate(movement.date)} · {movement.category}
                </p>
                <span
                  className={`text-sm mr-3 md:mr-4 font-semibold ${movement.type === "entrada" ? "text-emerald-600" : "text-rose-500"
                    }`}
                >
                  {movement.type === "entrada" ? "+" : "−"}
                  {formatBRL(movement.value)}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 mr-3 md:mr-4">
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
    </section>
  );
}
