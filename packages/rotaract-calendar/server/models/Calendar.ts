import mongoose from "mongoose";
import { CalendarType } from "../types/Calendar";

const calendarSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: false,
      enum: ["reuniao", "reunião", "projeto", "evento", "outro"],
      trim: true,
    },
    date_start: {
      type: String,
      required: true,
    },
    date_end: {
      type: String,
      required: true,
    },
    hour_start: {
      type: String,
      required: true,
    },
    hour_end: {
      type: String,
      required: true,
    },
    all_day: {
      type: Boolean,
      required: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    members: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "calendar",
  }
);

export const Calendar =
  (mongoose.models.Calendar as mongoose.Model<CalendarType> | undefined) ??
  mongoose.model<CalendarType>("calendar", calendarSchema);
