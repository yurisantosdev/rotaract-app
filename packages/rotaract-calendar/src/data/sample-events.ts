import { addDays } from "../lib/dates";
import type { CalendarEvent } from "../types/event";

function at(date: Date, hour: number, minute = 0): string {
  const value = new Date(date);
  value.setHours(hour, minute, 0, 0);
  return value.toISOString();
}

function pick(ids: string[], offset: number, count: number): string[] {
  if (ids.length === 0) return [];
  return Array.from({ length: Math.min(count, ids.length) }, (_, index) => {
    return ids[(offset + index) % ids.length] ?? "";
  }).filter(Boolean);
}
