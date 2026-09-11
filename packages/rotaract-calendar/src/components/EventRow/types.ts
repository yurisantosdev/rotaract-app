import { CalendarEvent } from "../../types/event";

export type EventRowProps = {
  event: CalendarEvent;
  now: Date;
  dateLabel?: string;
}
