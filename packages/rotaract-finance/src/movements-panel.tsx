"use client";

import { FormEvent, useMemo, useState } from "react";
import { formatBRL, formatDate, todayISO } from "./money";
import {
  MOVEMENT_CATEGORIES,
  type Movement,
  type MovementType,
} from "./sample-data";

const inputClassName =
  "h-11 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-900 outline-none ring-rotaract-pink/20 transition placeholder:text-zinc-400 focus:border-rotaract-pink/50 focus:bg-white focus:ring-4";

type MovementsPanelProps = {
  movements: Movement[];
  onAdd: (movement: Omit<Movement, "id">) => void;
  onRemove: (id: string) => void;
};

export function MovementsPanel({
  movements,
  onAdd,
  onRemove,
}: MovementsPanelProps) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"todos" | MovementType>("todos");
  const [formOpen, setFormOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<(typeof MOVEMENT_CATEGORIES)[number]>(
    "Mensalidade"
  );
  const [type, setType] = useState<MovementType>("entrada");
  const [date, setDate] = useState(todayISO());
  const [error, setError] = useState("");

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
    setAmount("");
    setCategory("Mensalidade");
    setType("entrada");
    setDate(todayISO());
    setError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedAmount = Number(amount.replace(",", "."));

    if (!description.trim()) {
      setError("Informe a descrição da movimentação.");
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Informe um valor maior que zero.");
      return;
    }

    onAdd({
      date,
      description: description.trim(),
      category,
      type,
      amount: parsedAmount,
    });
    resetForm();
    setFormOpen(false);
  }

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-[0_12px_40px_rgba(24,24,27,0.04)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Movimentações</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Filtre, registre e acompanhe entradas e saídas do clube.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setFormOpen((open) => !open);
            setError("");
          }}
          className="inline-flex h-11 items-center justify-center rounded-full bg-rotaract-pink px-4 text-sm font-semibold text-white transition hover:bg-rotaract-magenta"
        >
          {formOpen ? "Cancelar" : "Nova movimentação"}
        </button>
      </div>

      {formOpen ? (
        <form
          onSubmit={handleSubmit}
          className="mt-5 grid gap-3 rounded-2xl border border-zinc-200 bg-rotaract-mist/70 p-4 sm:grid-cols-2 lg:grid-cols-6"
        >
          <label className="sm:col-span-2 lg:col-span-2">
            <span className="mb-1.5 block text-sm text-zinc-600">Descrição</span>
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={inputClassName}
              placeholder="Ex.: Mensalidades de setembro"
            />
          </label>
          <label>
            <span className="mb-1.5 block text-sm text-zinc-600">Valor</span>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className={inputClassName}
              placeholder="0,00"
            />
          </label>
          <label>
            <span className="mb-1.5 block text-sm text-zinc-600">Data</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={inputClassName}
            />
          </label>
          <label>
            <span className="mb-1.5 block text-sm text-zinc-600">Categoria</span>
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as (typeof MOVEMENT_CATEGORIES)[number])
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
          <label>
            <span className="mb-1.5 block text-sm text-zinc-600">Tipo</span>
            <select
              value={type}
              onChange={(event) => setType(event.target.value as MovementType)}
              className={inputClassName}
            >
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
          </label>
          <div className="flex items-end sm:col-span-2 lg:col-span-6">
            <button
              type="submit"
              className="h-11 rounded-full bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              Salvar movimentação
            </button>
          </div>
          {error ? (
            <p className="text-sm text-rose-500 sm:col-span-2 lg:col-span-6">{error}</p>
          ) : null}
        </form>
      ) : null}

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
              className={`h-9 rounded-full px-3 text-sm font-medium transition ${
                typeFilter === value
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {label}
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
          filtered.map((movement) => (
            <li
              key={movement.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium text-zinc-900">{movement.description}</p>
                <p className="mt-1 text-sm text-zinc-500">
                  {formatDate(movement.date)} · {movement.category}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-semibold ${
                    movement.type === "entrada" ? "text-emerald-600" : "text-rose-500"
                  }`}
                >
                  {movement.type === "entrada" ? "+" : "−"}
                  {formatBRL(movement.amount)}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(movement.id)}
                  className="rounded-full px-3 py-1.5 text-sm text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
