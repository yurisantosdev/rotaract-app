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
import { MovementsPanel } from "./components/movement/movements-panel";
import { ReportPanel } from "./components/report-panel";
import {
  type Movement,
  Tab,
  tabs,
} from "./types/movement";
import { TitleModule, ReturnModule } from "@rotaract/components";
import { CardsPrincipal } from "./components/cardsPrincipal";
import { Contribution } from "./types/contributions";
import { exemptContribution, listContributions, removeContribution, updateContribution } from "./services/contributions";

export type FinancePageProps = {
  userName: string;
  backHref?: string;
};

export function FinancePage({
  userName,
  backHref = "/home",
}: FinancePageProps) {
  const firstName = userName.split(" ")[0] || userName;
  const [tab, setTab] = useState<Tab>("movimentos");
  const [movements, setMovements] = useState<Movement[]>([]);
  const [contributions, setContributions] =
    useState<Contribution[]>([]);

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

    listContributions(controller.signal)
      .then(setContributions)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setContributions([]);
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

  function refreshMovements() {
    const controller = new AbortController();
    return listMovements(controller.signal)
      .then(setMovements)
      .catch(() => undefined);
  }

  function handleToggleContribution(id: string) {
    const contribution = contributions.find((item) => item.id === id);
    if (!contribution) return;

    const nextStatus =
      contribution.status === "pendente" ? "pago" : "pendente";
    const controller = new AbortController();

    void updateContribution(id, controller.signal, {
      ...contribution,
      status: nextStatus,
    })
      .then((updated) => {
        setContributions((current) =>
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: updated.status,
                }
              : item
          )
        );
        return refreshMovements();
      })
      .catch(() => undefined);
  }

  function handleExemptContribution(id: string) {
    const controller = new AbortController();

    void exemptContribution(id, controller.signal)
      .then((updated) => {
        setContributions((current) =>
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: updated.status,
                }
              : item
          )
        );
        return refreshMovements();
      })
      .catch(() => undefined);
  }

  function handleRemoveContribution(id: string) {
    const controller = new AbortController();

    void removeContribution(id, controller.signal)
      .then(() => {
        setContributions((current) => current.filter((item) => item.id !== id));
        return refreshMovements();
      })
      .catch(() => undefined);
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

      <CardsPrincipal totals={totals} />

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
            onExempt={handleExemptContribution}
            onRemove={handleRemoveContribution}
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
