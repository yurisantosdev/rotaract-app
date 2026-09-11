"use client";

import { isSameDay } from "../../lib/dates";
import { isEventInMonth, isUpcomingEvent } from "../../types/event";
import { CalendarStatsProps } from "./types";

export function useCalendarStats({ events }: CalendarStatsProps) {
  const now = new Date();
  const thisMonth = events.filter((event) => isEventInMonth(event, now)).length;
  const upcoming = events.filter((event) => isUpcomingEvent(event, now)).length;
  const today = events.filter((event) =>
    isSameDay(new Date(event.startsAt), now)
  ).length;

  return {
    now,
    thisMonth,
    upcoming,
    today
  };
}
