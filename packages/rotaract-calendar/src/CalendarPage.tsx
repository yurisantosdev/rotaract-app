"use client";

import { Loading, Main, ReturnModule, TitleModule } from "@rotaract/components";
import CalendarStats from "./components/CalendarStats";
import { CalendarWorkspace } from "./components/CalendarWorkspace";
import { useCalendar } from "./services/calendar.services";
import type { CalendarPageProps } from "./types/calendar";

export function CalendarPage({
  userName,
  currentUserId,
  backHref = "/home",
}: CalendarPageProps) {
  const {
    firstName,
    members,
    events,
    loadError,
    isLoading,
    handleCreate,
    handleUpdate,
    handleRemove,
  } = useCalendar(userName);

  return (
    <Main>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {isLoading ? <Loading /> : null}

        <ReturnModule backHref={backHref} />

        <TitleModule
          module="Módulo agenda"
          title="Agenda"
          description={`Olá, ${firstName}. Gerencie reuniões, projetos e compromissos do clube.`}
        />

        {loadError ? (
          <p className="mt-5 text-sm text-rose-700" role="alert">
            {loadError}
          </p>
        ) : null}

        <CalendarStats events={events} />
        <CalendarWorkspace
          events={events}
          members={members}
          currentUserId={currentUserId}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
        />
      </main>
    </Main>
  );
}
