import { CalendarEvent } from "../../types/event";

export type UpcomingEventsProps = {
  calendarHref?: string;
};

export type LoadState = "loading" | "ready" | "error";

export type DayGroup = {
  day: Date;
  events: CalendarEvent[];
};
