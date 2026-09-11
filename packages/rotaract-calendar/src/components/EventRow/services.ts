"use client";

import { CalendarEvent, EVENT_KIND_STYLES } from "../../types/event";
import { EventRowProps } from "./types";

export function useEventRow({
  event,
  now
}: EventRowProps) {
  function isEventEnded(event: CalendarEvent, now: Date): boolean {
    return new Date(event.endsAt).getTime() < now.getTime();
  }

  const ended = isEventEnded(event, now);
  const kindStyles = EVENT_KIND_STYLES[event.kind] ?? EVENT_KIND_STYLES.outro;

  return {
    ended,
    kindStyles
  };
}
