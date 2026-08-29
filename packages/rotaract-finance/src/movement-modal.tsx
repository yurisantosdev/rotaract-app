"use client";

import {
  FormEvent,
  useEffect,
  useId,
  useRef,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { MOVEMENT_CATEGORIES, type MovementType } from "./sample-data";

const inputClassName =
  "h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-900 outline-none ring-rotaract-pink/20 transition placeholder:text-zinc-400 focus:border-rotaract-pink/50 focus:bg-white focus:ring-4";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

type MovementModalProps = {
  open: boolean;
  description: string;
  amount: string;
  date: string;
  category: (typeof MOVEMENT_CATEGORIES)[number];
  type: MovementType;
  error: string;
  onDescriptionChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onCategoryChange: (value: (typeof MOVEMENT_CATEGORIES)[number]) => void;
  onTypeChange: (value: MovementType) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function MovementModal({
  open,
  description,
  amount,
  date,
  category,
  type,
  error,
  onDescriptionChange,
  onAmountChange,
  onDateChange,
  onCategoryChange,
  onTypeChange,
  onClose,
  onSubmit,
}: MovementModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      descriptionRef.current?.focus();
    });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const nodes = [
        ...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ].filter((node) => !node.hasAttribute("disabled") && node.tabIndex !== -1);

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open]);

  function handleBackdropMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="finance-modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/45 p-3 backdrop-blur-md sm:items-center sm:p-6"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="finance-modal-panel w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-[0_24px_80px_rgba(24,24,27,0.22)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-rotaract-pink">
              Tesouraria
            </p>
            <h2 id={titleId} className="mt-1 text-xl font-semibold tracking-tight text-zinc-900">
              Nova movimentação
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Registre uma entrada ou saída. Os totais da tesouraria atualizam na hora.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-800"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

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
                className={`h-11 rounded-[1.1rem] text-sm font-semibold transition ${
                  type === value
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
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => onAmountChange(event.target.value)}
                  className={`${inputClassName} pl-12`}
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
              Salvar movimentação
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
