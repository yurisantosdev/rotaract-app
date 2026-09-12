"use client";

import { ContributionsPanel } from "./components/contributions/ContributionsPanel";
import { MovementsPanel } from "./components/movements/MovementsPanel";
import { ReportPanel } from "./components/reportPanel/ReportPanel";
import {
  tabs,
} from "./types/movement";
import { TitleModule, ReturnModule, Main } from "@rotaract/components";
import { CardsPrincipal } from "./components/cardsPrincipal";
import { Loading } from "@rotaract/components";
import { FinancePageProps } from "./types/finance";
import { useFinance } from "./services/finance.services";

export function FinancePage({
  userName,
  backHref = "/home",
}: FinancePageProps) {
  const data = useFinance(userName);
  if (data === null) return null;
  const {
    isLoading,
    firstName,
    tab,
    setTab,
    movements,
    contributions,
    totals,
    handleAddMovement,
    handleUpdateMovement,
    handleRemoveMovement,
    handleImportedMovements,
    handleToggleContribution,
    handleExemptContribution,
    handleRemoveContribution,
    handleGenerateContributions,
    handleDownloadReport
  } = data;

  return (
    <Main>
      <main className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10 sm:px-6">
        {isLoading ? <Loading /> : null}
        <ReturnModule backHref={backHref} />

        <TitleModule
          module="Módulo financeiro"
          title="Tesouraria"
          description={`Olá, ${firstName}. O módulo financeiro centraliza suas informações, facilitando o controle de receitas, despesas, contas e mensalidades`}
        />

        <CardsPrincipal totals={totals} />

        <div
          role="tablist"
          aria-label="Áreas da tesouraria"
          className="mt-8 grid grid-cols-3 gap-1 rounded-full border border-zinc-200 bg-white p-1"
        >
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`h-10 min-w-0 rounded-full px-1.5 text-xs font-medium transition sm:px-4 sm:text-sm ${tab === item.id
                ? "bg-rotaract-pink text-white"
                : "text-zinc-500 hover:text-zinc-800"
                }`}
            >
              <span className="block truncate">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 min-w-0">
          {tab === "movimentos" ? (
            <MovementsPanel
              movements={movements}
              onAdd={handleAddMovement}
              onUpdate={handleUpdateMovement}
              onRemove={handleRemoveMovement}
              onImported={handleImportedMovements}
            />
          ) : null}
          {tab === "mensalidades" ? (
            <ContributionsPanel
              contributions={contributions}
              onToggle={handleToggleContribution}
              onExempt={handleExemptContribution}
              onRemove={handleRemoveContribution}
              onGenerate={handleGenerateContributions}
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
    </Main>
  );
}
