import { CalendarEvent, CalendarEventPayload } from "@/src/types/event";
import { Member } from "@rotaract/members";

export type EventFormModalProps = {
  open: boolean;
  selectedDate: Date;
  event: CalendarEvent | null;
  members: Member[];
  currentUserId?: string;
  onClose: () => void;
  onSave: (payload: CalendarEventPayload) => void | Promise<void>;
  onDelete?: () => void;
};