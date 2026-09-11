"use client";

import { ArrowRightIcon, CalendarBlankIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { calendarToEvent } from "../lib/calendar-event";
import {
  addDays,
  eventOccursOnDay,
  isSameDay,
} from "../lib/dates";
import { listCalendar } from "../services/calendar";
import {
  type CalendarEvent,
} from "../types/event";
import { EmptyState } from "./EmptyState";
import { EventRow } from "./EventRow";

export type UpcomingEventsProps = {
  calendarHref?: string;
};

const VISIBLE_EVENTS = 1;

type LoadState = "loading" | "ready" | "error";

type DayGroup = {
  day: Date;
  events: CalendarEvent[];
};

function startOfDay(date: Date): Date {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
}

function compareEvents(a: CalendarEvent, b: CalendarEvent): number {
  if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
  return a.startsAt.localeCompare(b.startsAt);
}

function eventsOnDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events
    .filter((event) => eventOccursOnDay(event.startsAt, event.endsAt, day))
    .sort(compareEvents);
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatGroupDate(day: Date, tomorrow: Date): string {
  if (isSameDay(day, tomorrow)) return "Amanhã";

  return capitalize(
    day.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
  );
}

function overflowLabel(hiddenCount: number) {
  if (hiddenCount <= 0) return null;

  return (
    <p className="px-1 text-[10px] text-zinc-400">+{hiddenCount} mais</p>
  );
}

function limitDayGroups(groups: DayGroup[], limit: number): {
  groups: DayGroup[];
  overflow: number;
} {
  const total = groups.reduce((count, group) => count + group.events.length, 0);
  const overflow = Math.max(0, total - limit);
  if (overflow === 0) return { groups, overflow: 0 };

  const limited: DayGroup[] = [];
  let remaining = limit;

  for (const group of groups) {
    if (remaining <= 0) break;
    limited.push({
      day: group.day,
      events: group.events.slice(0, remaining),
    });
    remaining -= Math.min(group.events.length, remaining);
  }

  return { groups: limited, overflow };
}



function AgendaSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2" aria-hidden>
      {Array.from({ length: 2 }, (_, column) => (
        <div key={column} className="space-y-3">
          <div className="h-4 w-24 animate-pulse rounded-full bg-zinc-100" />
          {Array.from({ length: 1 }, (_, row) => (
            <div
              key={row}
              className="h-[4.25rem] animate-pulse rounded-2xl bg-zinc-100"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function UpcomingEvents({
  calendarHref = "/home/calendar",
}: UpcomingEventsProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [now] = useState(() => new Date());

  useEffect(() => {
    const controller = new AbortController();

    void listCalendar(controller.signal)
      .then((list) => {
        if (controller.signal.aborted) return;
        setEvents(list.map(calendarToEvent));
        setState("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setEvents([]);
        setState("error");
      });

    return () => controller.abort();
  }, []);

  const today = useMemo(() => startOfDay(now), [now]);
  const tomorrow = useMemo(() => addDays(today, 1), [today]);

  const todayEvents = useMemo(
    () => eventsOnDay(events, today),
    [events, today]
  );

  const upcomingGroups = useMemo<DayGroup[]>(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const day = addDays(today, index + 1);
      return { day, events: eventsOnDay(events, day) };
    }).filter((group) => group.events.length > 0);
  }, [events, today]);

  const upcomingCount = useMemo(
    () =>
      new Set(
        upcomingGroups.flatMap((group) => group.events.map((event) => event.id))
      ).size,
    [upcomingGroups]
  );

  const visibleTodayEvents = todayEvents.slice(0, VISIBLE_EVENTS);
  const todayOverflow = todayEvents.length - visibleTodayEvents.length;
  const visibleUpcoming = limitDayGroups(upcomingGroups, VISIBLE_EVENTS);

  return (
    <section
      className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-[0_12px_40px_rgba(24,24,27,0.04)] sm:p-6"
      aria-labelledby="upcoming-events-title"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rotaract-pink/10 text-rotaract-pink">
            <CalendarBlankIcon size={24} weight="bold" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-rotaract-pink">
              Agenda
            </p>
            <h2
              id="upcoming-events-title"
              className="mt-1 text-lg font-semibold tracking-tight text-zinc-900"
            >
              Hoje e próximos 7 dias
            </h2>
          </div>
        </div>

        <Link
          href={calendarHref}
          className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-rotaract-pink"
        >
          Ver agenda
          <ArrowRightIcon
            size={16}
            weight="bold"
            className="transition group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>

      <div className="mt-5">
        {state === "loading" ? <AgendaSkeleton /> : null}

        {state === "error" ? (
          <p className="text-sm text-rose-700" role="alert">
            Não foi possível carregar os agendamentos.
          </p>
        ) : null}

        {state === "ready" ? (
          <div className="grid gap-6 sm:grid-cols-2 sm:items-start sm:gap-8">
            <div>
              <div className="flex h-6 items-center justify-between gap-2">
                <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Hoje
                </h3>
                <span className="rounded-full bg-rotaract-pink/10 px-2 py-0.5 text-[11px] font-semibold text-rotaract-pink">
                  {todayEvents.length}
                </span>
              </div>
              {todayEvents.length === 0 ? (
                <div className="mt-3">
                  <EmptyState message="Nenhum compromisso hoje." />
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  <ul className="space-y-2">
                    {visibleTodayEvents.map((event) => (
                      <EventRow key={event.id} event={event} now={now} />
                    ))}
                  </ul>
                  {overflowLabel(todayOverflow)}
                </div>
              )}
            </div>

            <div className="sm:border-l sm:border-zinc-100 sm:pl-8">
              <div className="flex h-6 items-center justify-between gap-2">
                <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Próximos 7 dias
                </h3>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-600">
                  {upcomingCount}
                </span>
              </div>
              {upcomingGroups.length === 0 ? (
                <div className="mt-3">
                  <EmptyState message="Nada agendado nos próximos 7 dias." />
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  <ul className="space-y-2">
                    {visibleUpcoming.groups.flatMap((group) =>
                      group.events.map((event) => (
                        <EventRow
                          key={`${group.day.toISOString()}-${event.id}`}
                          event={event}
                          now={now}
                          dateLabel={formatGroupDate(group.day, tomorrow)}
                        />
                      ))
                    )}
                  </ul>
                  {overflowLabel(visibleUpcoming.overflow)}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
