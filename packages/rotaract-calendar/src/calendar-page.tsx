"use client";

import { useEffect, useState } from "react";
import { CheckCircleIcon } from "@phosphor-icons/react";
import { Loading, ReturnModule, TitleModule } from "@rotaract/components";
import { CalendarStats } from "./components/calendar-stats";
import { CalendarWorkspace } from "./components/calendar-workspace";
import { dateTimeInputToIso, toDateInputValue, toTimeInputValue } from "./lib/dates";
import { createCalendar, listCalendar, removeCalendar, updateCalendar } from "./services/calendar";
import { listMembers } from "./services/members";
import type { Calendar, CalendarPayload, Member } from "./types/calendar";
import type { CalendarEvent, CalendarEventPayload } from "./types/event";

export type CalendarPageProps = {
  userName: string;
  currentUserId?: string;
  backHref?: string;
};

function calendarToEvent(calendar: Calendar): CalendarEvent {
  const startTime = calendar.all_day ? "00:00" : calendar.hour_start || "00:00";
  const endTime = calendar.all_day ? "23:59" : calendar.hour_end || "23:59";

  return {
    id: calendar.id,
    title: calendar.title,
    notes: calendar.description || undefined,
    startsAt: dateTimeInputToIso(calendar.date_start, startTime),
    endsAt: dateTimeInputToIso(calendar.date_end, endTime),
    allDay: calendar.all_day,
    kind: calendar.type,
    memberIds: calendar.members,
  };
}

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
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [notice, setNotice] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  function handleCreate(payload: CalendarEventPayload) {
    const controller = new AbortController();

    return createCalendar(controller.signal, eventToCalendarPayload(payload)).then(
      (created) => {
        setEvents((current) => [calendarToEvent(created), ...current]);
        setNotice("Evento cadastrado.");
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
        setNotice("Evento atualizado.");
      }
    );
  }

  function handleRemove(id: string) {
    const controller = new AbortController();

    return removeCalendar(id, controller.signal)
      .then(() => {
        setEvents((current) => current.filter((item) => item.id !== id));
        setLoadError("");
        setNotice("Evento removido da agenda.");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setLoadError(
          error instanceof Error
            ? error.message
            : "Não foi possível excluir o agendamento."
        );
      });
  }

  useEffect(() => {
    const controller = new AbortController();

    void Promise.all([
      listCalendar(controller.signal)
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
        }),
      listMembers(controller.signal)
        .then((list) => {
          if (controller.signal.aborted) return;
          setMembers(list);
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
          setMembers([]);
        }),
    ]).finally(() => {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    });

    return () => controller.abort();
  }, []);

  return (
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

      {notice ? (
        <p
          className="mt-5 inline-flex items-center gap-1.5 text-sm text-emerald-700"
          role="status"
        >
          <CheckCircleIcon size={16} weight="fill" aria-hidden />
          {notice}
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
  );
}
