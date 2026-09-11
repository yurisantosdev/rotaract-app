"use client";

import { useEffect, useState } from "react";
import { AlertError, AlertSuccess, Loading, Main, ReturnModule, TitleModule } from "@rotaract/components";
import { useMembers, useMembersStatus } from "@rotaract/members";
import { CalendarStats } from "./components/calendar-stats";
import { CalendarWorkspace } from "./components/calendar-workspace";
import { calendarToEvent } from "./lib/calendar-event";
import { toDateInputValue, toTimeInputValue } from "./lib/dates";
import { createCalendar, listCalendar, removeCalendar, updateCalendar } from "./services/calendar";
import type { CalendarPayload } from "./types/calendar";
import type { CalendarEvent, CalendarEventPayload } from "./types/event";

export type CalendarPageProps = {
  userName: string;
  currentUserId?: string;
  backHref?: string;
};

function eventToCalendarPayload(payload: CalendarEventPayload): CalendarPayload {
  const start = new Date(payload.startsAt);
  const end = new Date(payload.endsAt);

  return {
    title: payload.title,
    type: payload.kind,
    date_start: toDateInputValue(start),
    date_end: toDateInputValue(end),
    hour_start: payload.allDay ? "00:00" : toTimeInputValue(start),
    hour_end: payload.allDay ? "23:59" : toTimeInputValue(end),
    all_day: payload.allDay,
    description: payload.notes,
    members: payload.memberIds,
  };
}

export function CalendarPage({
  userName,
  currentUserId,
  backHref = "/home",
}: CalendarPageProps) {
  const firstName = userName.split(" ")[0] || userName;
  const members = useMembers();
  const membersStatus = useMembersStatus();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loadError, setLoadError] = useState("");
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);
  const isLoading =
    isLoadingCalendar ||
    membersStatus === "idle" ||
    membersStatus === "loading";

  function handleCreate(payload: CalendarEventPayload) {
    const controller = new AbortController();

    return createCalendar(controller.signal, eventToCalendarPayload(payload)).then(
      (created) => {
        setEvents((current) => [calendarToEvent(created), ...current]);
      }
    );
  }

  function handleUpdate(id: string, payload: CalendarEventPayload) {
    const controller = new AbortController();

    return updateCalendar(id, controller.signal, eventToCalendarPayload(payload)).then(
      (updated) => {
        setEvents((current) =>
          current.map((item) =>
            item.id === updated.id ? calendarToEvent(updated) : item
          )
        );
      }
    );
  }

  function handleRemove(id: string) {
    const controller = new AbortController();

    return removeCalendar(id, controller.signal)
      .then(() => {
        setEvents((current) => current.filter((item) => item.id !== id));
        AlertSuccess("Agendamento excluído com sucesso");
        setLoadError("");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        AlertError("Não foi possível excluir o agendamento.");
        setLoadError("Não foi possível excluir o agendamento.");
      });
  }

  useEffect(() => {
    const controller = new AbortController();

    void listCalendar(controller.signal)
      .then((list) => {
        if (controller.signal.aborted) return;
        setEvents(list.map(calendarToEvent));
        setLoadError("");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setEvents([]);
        setLoadError("Não foi possível carregar os agendamentos.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingCalendar(false);
        }
      });

    return () => controller.abort();
  }, []);

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
