"use client";

import { useRef } from "react";
import { Modal } from "@rotaract/components";
import { formatMoneyInput } from "../services/money";
import { MOVEMENT_CATEGORIES, inputClassName } from "../types/movement";
import { MovementModalProps } from "../types/movementModal";

export function MovementModal({
  open,
  mode = "create",
  description,
  value,
  date,
  category,
  type,
  error,
  onDescriptionChange,
  onValueChange,
  onDateChange,
  onCategoryChange,
  onTypeChange,
  onClose,
  onSubmit,
}: MovementModalProps) {
  const descriptionRef = useRef<HTMLInputElement>(null);
  const isEdit = mode === "edit";

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Tesouraria"
      title={isEdit ? "Editar movimentação" : "Nova movimentação"}
      description={
        isEdit
          ? "Atualize os dados desta entrada ou saída. Os totais da tesouraria atualizam na hora."
          : "Registre uma entrada ou saída. Os totais da tesouraria atualizam na hora."
      }
      initialFocusRef={descriptionRef}
    >
      <form onSubmit={onSubmit} className="px-5 py-5 sm:px-6">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-rotaract-mist p-1">
          {(
            [
              ["entrada", "Entrada"],
              ["saida", "Saída"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onTypeChange(value)}
              className={`h-11 rounded-[1.1rem] text-sm font-semibold transition ${type === value
                ? value === "entrada"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "bg-white text-rose-600 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-sm text-zinc-600">Descrição</span>
          <input
            ref={descriptionRef}
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            className={inputClassName}
            placeholder="Ex.: Mensalidades de setembro"
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
                onChange={(event) => onValueChange(formatMoneyInput(event.target.value))}
                className={`${inputClassName} pl-12 tabular-nums`}
                placeholder="0,00"
              />
            </span>
          </label>
          <label>
            <span className="mb-1.5 block text-sm text-zinc-600">Data</span>
            <input
              type="date"
              value={date}
              onChange={(event) => onDateChange(event.target.value)}
              className={inputClassName}
            />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm text-zinc-600">Categoria</span>
          <select
            value={category}
            onChange={(event) =>
              onCategoryChange(
                event.target.value as (typeof MOVEMENT_CATEGORIES)[number]
              )
            }
            className={inputClassName}
          >
            {MOVEMENT_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

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
            className="h-12 rounded-full bg-rotaract-pink px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(255,45,122,0.28)] transition hover:bg-rotaract-magenta"
          >
            {isEdit ? "Salvar alterações" : "Salvar movimentação"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
