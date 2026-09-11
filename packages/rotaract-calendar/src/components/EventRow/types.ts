import { CalendarEvent } from "@/src/types/event";

export type EventRowProps = {
  event: CalendarEvent;
  now: Date;
  dateLabel?: string;
}
