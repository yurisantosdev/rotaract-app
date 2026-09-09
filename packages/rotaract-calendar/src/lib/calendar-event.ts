import { dateTimeInputToIso } from "./dates";
import type { Calendar } from "../types/calendar";
import type { CalendarEvent } from "../types/event";

export function calendarToEvent(calendar: Calendar): CalendarEvent {
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
