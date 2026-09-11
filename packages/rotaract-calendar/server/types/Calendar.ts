import mongoose from "mongoose";

export type TypeCalendar = "reuniao" | "projeto" | "evento" | "outro";

type AcceptStatusType = "pending" | "accepted" | "rejected";

export type MembersCalendarType = {
  _id: string;
  accept?: AcceptStatusType;
}

export type CalendarType = {
  _id: mongoose.Types.ObjectId;
  title: string;
  type: TypeCalendar;
  date_start: string;
  date_end: string;
  hour_start: string;
  hour_end: string;
  all_day: boolean;
  description: string;
  members: MembersCalendarType[];
  createdAt: Date;
  updatedAt: Date;
};