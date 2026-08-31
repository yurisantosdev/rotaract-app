"use client";

import { useEffect, useMemo, useState } from "react";
import { ContributionsPanel } from "./components/contributions-panel";
import { formatBRL, isInCurrentMonth } from "./services/money";
import {
  createMovement,
  listMovements,
  removeMovement,
  updateMovement,
} from "./services/movements";
import { MovementsPanel } from "./components/movements-panel";
import { ReportPanel } from "./components/report-panel";
import {
  INITIAL_CONTRIBUTIONS,
  type Contribution,
  type Movement,
} from "./types/movement";
import { TitleModule, ReturnModule } from "@rotaract/components";
import { Card } from "./components/card";

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
  const [movements, setMovements] = useState<Movement[]>([]);
  const [contributions, setContributions] =
    useState<Contribution[]>(INITIAL_CONTRIBUTIONS);


  useEffect(() => {
    const controller = new AbortController();

    listMovements(controller.signal)
      .then(setMovements)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setMovements([]);
      });

    return () => controller.abort();
  }, []);

  const totals = useMemo(() => {
    const income = movements
      .filter((item) => item.type === "entrada")
      .reduce((sum, item) => sum + item.value, 0);
    const expense = movements
      .filter((item) => item.type === "saida")
      .reduce((sum, item) => sum + item.value, 0);
    const monthIncome = movements
      .filter((item) => item.type === "entrada" && isInCurrentMonth(item.date))
      .reduce((sum, item) => sum + item.value, 0);
    const monthExpense = movements
      .filter((item) => item.type === "saida" && isInCurrentMonth(item.date))
      .reduce((sum, item) => sum + item.value, 0);
    const pending = contributions.filter((item) => item.status === "pendente");

    return {
      balance: income - expense,
      monthIncome,
      monthExpense,
      pendingCount: pending.length,
      pendingValue: pending.reduce((sum, item) => sum + item.value, 0),
    };
  }, [contributions, movements]);

  function handleAddMovement(movement: Omit<Movement, "id">) {
    const controller = new AbortController();

    return createMovement(controller.signal, movement).then((created) => {
      setMovements((current) => [
        {
          id: created.id,
          date: created.date,
          description: created.description,
          category: created.category,
          type: created.type,
          value: created.value,
        },
        ...current,
      ]);
    });
  }

  function handleUpdateMovement(movement: Movement) {
    const controller = new AbortController();

    return updateMovement(movement.id, controller.signal, movement).then(
      (updated) => {
        setMovements((current) =>
          current.map((item) =>
            item.id === movement.id
              ? {
                  ...item,
                  date: updated.date,
                  description: updated.description,
                  category: updated.category,
                  type: updated.type,
                  value: updated.value,
                }
              : item
          )
        );
      }
    );
  }

  function handleRemoveMovement(id: string) {
    const controller = new AbortController();

    void removeMovement(id, controller.signal)
      .then(() => {
        setMovements((current) => current.filter((item) => item.id !== id));
      })
      .catch(() => undefined);
  }

  function handleToggleContribution(id: string) {
    setContributions((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "pago" ? "pendente" : "pago" }
          : item
      )
    );
  }

  function handleDownloadReport() {
    const income = movements
      .filter((item) => item.type === "entrada")
      .reduce((sum, item) => sum + item.value, 0);
    const expense = movements
      .filter((item) => item.type === "saida")
      .reduce((sum, item) => sum + item.value, 0);
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
          `- ${item.date} | ${item.type} | ${item.category} | ${item.description} | ${formatBRL(item.value)}`
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
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <ReturnModule backHref={backHref} />

      <TitleModule
        module="Módulo financeiro"
        title="Tesouraria"
        description={`Olá, ${firstName}. O módulo financeiro foi desenvolvido para centralizar e organizar suas informações financeiras, permitindo acompanhar receitas, despesas, contas, movimentações e outros dados importantes de forma simples e organizada.`}
      />

      <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card
          title="Saldo atual"
          number={totals.balance}
          colorNumber="black"
        />

        <Card
          title="Entradas no mês"
          number={totals.monthIncome}
          colorNumber="green"
        />

        <Card
          title="Saídas no mês"
          number={totals.monthExpense}
          colorNumber="red"
        />

        <Card
          title="Mensalidades abertas"
          number={totals.pendingCount}
          colorNumber="black"
          description={`${formatBRL(totals.pendingValue)} a receber`}
        />
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
            className={`h-10 shrink-0 rounded-full px-4 text-sm font-medium transition ${tab === item.id
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
            onUpdate={handleUpdateMovement}
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
