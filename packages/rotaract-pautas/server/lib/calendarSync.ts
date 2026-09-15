import mongoose from "mongoose";
import { Pautas } from "../models/Pautas";

type CalendarMemberLean = {
  _id?: unknown;
  accept?: string;
};

type CalendarLean = {
  _id?: unknown;
  members?: CalendarMemberLean[];
};

function asIdString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toString" in value) {
    return String(value);
  }
  return "";
}

function getCalendarModel(): mongoose.Model<CalendarLean> | null {
  const model =
    (mongoose.models.calendar as mongoose.Model<CalendarLean> | undefined) ??
    (mongoose.models.Calendar as mongoose.Model<CalendarLean> | undefined);
  return model ?? null;
}

export function acceptedMemberIdsFromCalendar(
  calendar: CalendarLean | null | undefined
): string[] {
  if (!calendar?.members?.length) return [];

  return Array.from(
    new Set(
      calendar.members
        .filter((member) => member.accept === "accepted")
        .map((member) => asIdString(member._id))
        .filter((id) => mongoose.isValidObjectId(id))
    )
  );
}

export async function loadAcceptedMembersFromCalendar(
  calendarEventId: string
): Promise<string[]> {
  if (!mongoose.isValidObjectId(calendarEventId)) return [];

  const CalendarModel = getCalendarModel();
  if (!CalendarModel) return [];

  const calendar = await CalendarModel.findById(calendarEventId).lean();
  return acceptedMemberIdsFromCalendar(calendar as CalendarLean | null);
}

export async function mergeAcceptedIntoPresent(
  presentMemberIds: string[],
  calendarEventId: string | null | undefined
): Promise<string[]> {
  if (!calendarEventId) return presentMemberIds;

  const accepted = await loadAcceptedMembersFromCalendar(calendarEventId);
  return Array.from(new Set([...presentMemberIds, ...accepted]));
}

export async function syncPautasWithAcceptedCalendarMembers(
  calendarEventId: string
): Promise<void> {
  if (!mongoose.isValidObjectId(calendarEventId)) return;

  const accepted = await loadAcceptedMembersFromCalendar(calendarEventId);
  if (accepted.length === 0) return;

  const objectIds = accepted.map((id) => new mongoose.Types.ObjectId(id));

  await Pautas.updateMany(
    { calendarEventId: new mongoose.Types.ObjectId(calendarEventId) },
    {
      $addToSet: { presentMemberIds: { $each: objectIds } },
      $set: { generatedAt: null },
    }
  );
}
