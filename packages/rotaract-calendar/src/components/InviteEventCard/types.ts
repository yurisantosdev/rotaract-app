import { Calendar } from "@/src/types/calendar";

export type InviteEventCardProps = {
  calendar: Calendar;
  currentUserId: string;
  onResponded: () => void | Promise<void>;
};