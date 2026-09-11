import { CalendarEvent, CalendarEventPayload } from "../../types/event";
import { Member } from "@rotaract/members";

export type CalendarWorkspaceProps = {
  events: CalendarEvent[];
  members: Member[];
  currentUserId?: string;
  onCreate: (payload: CalendarEventPayload) => void | Promise<void>;
  onUpdate: (id: string, payload: CalendarEventPayload) => void | Promise<void>;
  onRemove: (id: string) => void | Promise<void>;
};

export type UseCalendarWorkspaceProps = Pick<
  CalendarWorkspaceProps,
  "events" | "onUpdate" | "onCreate"
>;