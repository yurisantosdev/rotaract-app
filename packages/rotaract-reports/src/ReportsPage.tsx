"use client";

import {
  Loading,
  Main,
  TitleModule,
} from "@rotaract/components";
import { ReportsPanel } from "./components/reportsPanel";
import { ReportsStats } from "./components/reportsStats";
import { useReportsPage } from "./services/reports.page.services";
import type { ReportsPageProps } from "./types/reports";
import { AccessDenied } from "./components/accessDenied";

export function ReportsPage({ user }: ReportsPageProps) {
  if (!user.developer) {
    return <AccessDenied />;
  }

  const data = useReportsPage(user.name);
  if (!data) return null;

  const {
    firstName,
    reports,
    isLoading,
    loadError,
    handleUpdate,
    handleRemove,
  } = data;

  return (
    <Main>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {isLoading ? <Loading /> : null}

        <TitleModule
          module="Módulo Feedbacks"
          title="Feedbacks"
          description={`Olá, ${firstName}. Acompanhe e atualize os bugs reportados no sistema.`}
        />

        {loadError ? (
          <p className="mt-5 text-sm text-rose-700" role="alert">
            {loadError}
          </p>
        ) : null}

        <ReportsStats reports={reports} />
        <ReportsPanel
          reports={reports}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
        />
      </main>
    </Main>
  );
}
