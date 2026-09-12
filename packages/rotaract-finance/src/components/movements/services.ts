"use client";

import { formatMoneyFromNumber, parseMoneyInput, todayISO } from "../../services/money.services";
import { MOVEMENT_CATEGORIES, Movement, MovementType } from "../../types/movement";
import { FormEvent, useMemo, useState } from "react";
import { UseMovementsProps } from "./types";
import { AlertSuccess, usePagination } from "@rotaract/components";

export function useMovements({ movements, onUpdate, onAdd }: UseMovementsProps) {
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
  const [importOpen, setImportOpen] = useState(false);

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

  const pagination = usePagination(filtered, {
    resetKey: `${query}|${typeFilter}`,
  });

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
        AlertSuccess("Movimentação atualizada com sucesso");
      } else {
        await onAdd(payload);
        AlertSuccess("Movimentação criada com sucesso");
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


  return {
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
  };
}
