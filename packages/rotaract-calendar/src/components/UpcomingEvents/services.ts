"use client";

import { addDays, eventOccursOnDay, isSameDay } from "@/src/lib/dates";
import { CalendarEvent } from "@/src/types/event";
import { DayGroup, LoadState } from "./types";
import { useEffect, useMemo, useState } from "react";
import { listCalendar } from "@/src/services/database.services";
import { calendarToEvent } from "@/src/lib/calendar-event";

export function useUpcomingEvents() {
  const VISIBLE_EVENTS = 1;

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

  return {
    state,
    todayEvents,
    visibleTodayEvents,
    now,
    todayOverflow,
    upcomingCount,
    upcomingGroups,
    visibleUpcoming,
    formatGroupDate,
    tomorrow
  };
}
