"use client";

import { useRef } from "react";
import { ArrowCircleDownIcon, ArrowCircleUpIcon } from "@phosphor-icons/react";
import { Button, DatePicker, Modal } from "@rotaract/components";
import {
  formatBRL,
  formatMoneyInput,
  parseMoneyInput,
} from "../../../services/money.services";
import { MOVEMENT_CATEGORIES } from "../../../types/movement";
import { MovementModalProps } from "../../../types/movementModal";

const fieldClassName =
  "h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-900 outline-none ring-rotaract-pink/20 transition placeholder:text-zinc-400 focus:border-rotaract-pink/50 focus:bg-white focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60";

const MOVEMENT_TYPES = [
  {
    id: "entrada" as const,
    label: "Entrada",
    hint: "Receita",
    Icon: ArrowCircleDownIcon,
    selectedClass: "bg-white text-emerald-700 shadow-sm",
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "saida" as const,
    label: "Saída",
    hint: "Despesa",
    Icon: ArrowCircleUpIcon,
    selectedClass: "bg-white text-rose-600 shadow-sm",
    iconClass: "bg-rose-50 text-rose-500",
  },
] as const;

export function MovementModal({
  open,
  mode = "create",
  description,
  value,
  date,
  category,
  type,
  error,
  saving = false,
  onDescriptionChange,
  onValueChange,
  onDateChange,
  onCategoryChange,
  onTypeChange,
  onClose,
  onSubmit,
}: MovementModalProps) {
  const valueRef = useRef<HTMLInputElement>(null);
  const isEdit = mode === "edit";
  const parsedValue = parseMoneyInput(value);
  const hasValue = Number.isFinite(parsedValue) && parsedValue > 0;
  const isIncome = type === "entrada";
  const descriptionInvalid = error.toLowerCase().includes("descrição");
  const valueInvalid = error.toLowerCase().includes("valor");

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Tesouraria"
      title={isEdit ? "Editar movimentação" : "Nova movimentação"}
      description={
        isEdit
          ? "Ajuste os dados desta entrada ou saída. Os totais atualizam na hora."
          : "Registre uma receita ou despesa. Os totais atualizam na hora."
      }
      initialFocusRef={valueRef}
    >
      <form onSubmit={onSubmit} className="flex max-h-[min(72vh,40rem)] flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div
            role="radiogroup"
            aria-label="Tipo da movimentação"
            className="grid grid-cols-2 gap-1 rounded-2xl bg-rotaract-mist p-1"
          >
            {MOVEMENT_TYPES.map((item) => {
              const selected = type === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={saving}
                  onClick={() => onTypeChange(item.id)}
                  className={`flex h-15 items-center justify-center gap-2.5 rounded-[1.1rem] px-2 text-left transition disabled:cursor-not-allowed sm:gap-3 sm:px-3 ${selected
                    ? item.selectedClass
                    : "text-zinc-500 hover:text-zinc-800"
                    }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${selected ? item.iconClass : "bg-white/70 text-zinc-400"
                      }`}
                  >
                    <item.Icon className="h-5 w-5" weight="bold" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-tight">
                      {item.label}
                    </span>
                    <span
                      className={`block text-xs font-medium ${selected ? "opacity-80" : "text-zinc-400"
                        }`}
                    >
                      {item.hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div
            className={`mt-5 rounded-[1.35rem] border p-4 transition ${isIncome
              ? "border-emerald-100 bg-emerald-50/50"
              : "border-rose-100 bg-rose-50/50"
              }`}
          >
            <label htmlFor="movement-value" className="block">
              <span className="block text-sm text-zinc-600">Valor</span>
              <span className="relative mt-2 block">
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-medium text-zinc-400">
                  R$
                </span>
                <input
                  id="movement-value"
                  ref={valueRef}
                  inputMode="numeric"
                  autoComplete="off"
                  disabled={saving}
                  aria-invalid={valueInvalid || undefined}
                  value={value}
                  onChange={(event) =>
                    onValueChange(formatMoneyInput(event.target.value))
                  }
                  className={`${fieldClassName} h-14 bg-white pl-12 text-2xl font-semibold tabular-nums tracking-tight ${valueInvalid
                    ? "border-rose-300 focus:border-rose-400 focus:ring-rose-200/60"
                    : isIncome
                      ? "focus:border-emerald-300 focus:ring-emerald-500/15"
                      : "focus:border-rose-300 focus:ring-rose-500/15"
                    }`}
                  placeholder="0,00"
                />
              </span>
            </label>
            <p
              className={`mt-2 text-xs font-medium ${hasValue
                ? isIncome
                  ? "text-emerald-700"
                  : "text-rose-600"
                : "text-zinc-400"
                }`}
            >
              {hasValue
                ? `${isIncome ? "+" : "−"} ${formatBRL(parsedValue)} na tesouraria`
                : "Informe o valor desta movimentação"}
            </p>
          </div>

          <label className="mt-5 block">
            <span className="mb-1.5 block text-sm text-zinc-600">Descrição</span>
            <input
              value={description}
              disabled={saving}
              aria-invalid={descriptionInvalid || undefined}
              onChange={(event) => onDescriptionChange(event.target.value)}
              className={`${fieldClassName} ${descriptionInvalid
                ? "border-rose-300 focus:border-rose-400 focus:ring-rose-200/60"
                : ""
                }`}
              placeholder="Ex.: Mensalidades de setembro"
              maxLength={80}
            />
          </label>

          <div className="mt-4">
            <label
              htmlFor="movement-date"
              className="mb-1.5 block text-sm text-zinc-600"
            >
              Data
            </label>
            <DatePicker
              id="movement-date"
              value={date}
              onChange={onDateChange}
              disabled={saving}
              fixedPopover
              allowClear={false}
            />
          </div>

          <fieldset className="mt-5">
            <legend className="mb-1.5 text-sm text-zinc-600">Categoria</legend>
            <div className="flex flex-wrap gap-2">
              {MOVEMENT_CATEGORIES.map((item) => {
                const selected = category === item;

                return (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={selected}
                    disabled={saving}
                    onClick={() => onCategoryChange(item)}
                    className={`h-10 rounded-full px-3.5 text-sm font-medium transition disabled:cursor-not-allowed ${selected
                      ? "bg-rotaract-pink text-white"
                      : "border border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
                      }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {error ? (
            <p
              className="mt-4 rounded-2xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600"
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-12 rounded-full px-5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cancelar
          </button>

          <Button
            type="submit"
            loading={saving}
            className="sm:min-w-46"
            title={
              saving
                ? "Salvando..."
                : isEdit
                  ? "Salvar alterações"
                  : "Salvar movimentação"
            }
          />
        </div>
      </form>
    </Modal>
  );
}
