"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ContributionsPanel } from "./contributions-panel";
import { formatBRL, isInCurrentMonth } from "./money";
import { MovementsPanel } from "./movements-panel";
import { ReportPanel } from "./report-panel";
import {
  INITIAL_CONTRIBUTIONS,
  INITIAL_MOVEMENTS,
  type Contribution,
  type Movement,
} from "./sample-data";

export type FinancePageProps = {
  userName: string;
  backHref?: string;
};

type Tab = "movimentos" | "mensalidades" | "relatorio";

const tabs: { id: Tab; label: string }[] = [
  { id: "movimentos", label: "Movimentações" },
  { id: "mensalidades", label: "Mensalidades" },
  { id: "relatorio", label: "Prestação de contas" },
];

export function FinancePage({
  userName,
  backHref = "/home",
}: FinancePageProps) {
  const firstName = userName.split(" ")[0] || userName;
  const [tab, setTab] = useState<Tab>("movimentos");
  const [movements, setMovements] = useState<Movement[]>(INITIAL_MOVEMENTS);
  const [contributions, setContributions] =
    useState<Contribution[]>(INITIAL_CONTRIBUTIONS);
  const [notice, setNotice] = useState("");

  const totals = useMemo(() => {
    const income = movements
      .filter((item) => item.type === "entrada")
      .reduce((sum, item) => sum + item.amount, 0);
    const expense = movements
      .filter((item) => item.type === "saida")
      .reduce((sum, item) => sum + item.amount, 0);
    const monthIncome = movements
      .filter((item) => item.type === "entrada" && isInCurrentMonth(item.date))
      .reduce((sum, item) => sum + item.amount, 0);
    const monthExpense = movements
      .filter((item) => item.type === "saida" && isInCurrentMonth(item.date))
      .reduce((sum, item) => sum + item.amount, 0);
    const pending = contributions.filter((item) => item.status === "pendente");

    return {
      balance: income - expense,
      monthIncome,
      monthExpense,
      pendingCount: pending.length,
      pendingAmount: pending.reduce((sum, item) => sum + item.amount, 0),
    };
  }, [contributions, movements]);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => {
      setNotice((current) => (current === message ? "" : current));
    }, 3500);
  }

  function handleAddMovement(movement: Omit<Movement, "id">) {
    setMovements((current) => [
      { ...movement, id: crypto.randomUUID() },
      ...current,
    ]);
    showNotice("Movimentação registrada neste exemplo.");
  }

  function handleRemoveMovement(id: string) {
    setMovements((current) => current.filter((item) => item.id !== id));
    showNotice("Movimentação removida.");
  }

  function handleToggleContribution(id: string) {
    setContributions((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "pago" ? "pendente" : "pago" }
          : item
      )
    );
    showNotice("Status da mensalidade atualizado.");
  }

  function handleDownloadReport() {
    const income = movements
      .filter((item) => item.type === "entrada")
      .reduce((sum, item) => sum + item.amount, 0);
    const expense = movements
      .filter((item) => item.type === "saida")
      .reduce((sum, item) => sum + item.amount, 0);
    const lines = [
      "Rotaract Club Chapecó — Prestação de contas (exemplo)",
      `Gerado por ${userName}`,
      "",
      `Saldo: ${formatBRL(income - expense)}`,
      `Entradas: ${formatBRL(income)}`,
      `Saídas: ${formatBRL(expense)}`,
      "",
      "Movimentações:",
      ...movements.map(
        (item) =>
          `- ${item.date} | ${item.type} | ${item.category} | ${item.description} | ${formatBRL(item.amount)}`
      ),
    ];

    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "prestacao-contas-exemplo.txt";
    link.click();
    URL.revokeObjectURL(url);
    showNotice("Resumo de exemplo baixado.");
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        href={backHref}
        className="text-sm font-medium text-rotaract-pink transition hover:text-rotaract-magenta"
      >
        ← Voltar para os módulos
      </Link>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-rotaract-pink">
            Módulo financeiro
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Tesouraria
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
            Olá, {firstName}. Esta é uma tela de exemplo: os dados ficam só nesta
            sessão e ainda não vão para a API.
          </p>
        </div>
        {notice ? (
          <p className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            {notice}
          </p>
        ) : null}
      </div>

      <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <article className="rounded-2xl border border-zinc-200 bg-white p-4 sm:rounded-3xl sm:p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Saldo atual
          </p>
          <p className="mt-2 text-xl font-semibold text-zinc-900 sm:text-2xl">
            {formatBRL(totals.balance)}
          </p>
        </article>
        <article className="rounded-2xl border border-zinc-200 bg-white p-4 sm:rounded-3xl sm:p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Entradas no mês
          </p>
          <p className="mt-2 text-xl font-semibold text-emerald-600 sm:text-2xl">
            {formatBRL(totals.monthIncome)}
          </p>
        </article>
        <article className="rounded-2xl border border-zinc-200 bg-white p-4 sm:rounded-3xl sm:p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Saídas no mês
          </p>
          <p className="mt-2 text-xl font-semibold text-rose-500 sm:text-2xl">
            {formatBRL(totals.monthExpense)}
          </p>
        </article>
        <article className="rounded-2xl border border-zinc-200 bg-white p-4 sm:rounded-3xl sm:p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Mensalidades abertas
          </p>
          <p className="mt-2 text-xl font-semibold text-zinc-900 sm:text-2xl">
            {totals.pendingCount}
          </p>
          <p className="mt-1 text-xs text-zinc-500">{formatBRL(totals.pendingAmount)} a receber</p>
        </article>
      </section>

      <div
        role="tablist"
        aria-label="Áreas da tesouraria"
        className="mt-8 flex gap-1 overflow-x-auto rounded-full border border-zinc-200 bg-white p-1"
      >
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`h-10 shrink-0 rounded-full px-4 text-sm font-medium transition ${
              tab === item.id
                ? "bg-rotaract-pink text-white"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "movimentos" ? (
          <MovementsPanel
            movements={movements}
            onAdd={handleAddMovement}
            onRemove={handleRemoveMovement}
          />
        ) : null}
        {tab === "mensalidades" ? (
          <ContributionsPanel
            contributions={contributions}
            onToggle={handleToggleContribution}
          />
        ) : null}
        {tab === "relatorio" ? (
          <ReportPanel
            movements={movements}
            contributions={contributions}
            onDownload={handleDownloadReport}
          />
        ) : null}
      </div>
    </main>
  );
}
