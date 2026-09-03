export type TypeCalendar = "reuniao" | "projeto" | "evento" | "compromisso" | "outro";

export type MemberStatus = "ativo" | "inativo";

export type Member = {
  id: string;
  name: string;
  photo?: string;
  role: string;
  status: MemberStatus;
};

export const MEMBER_INPUT_CLASS =
  "h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-900 outline-none ring-rotaract-pink/20 transition placeholder:text-zinc-400 focus:border-rotaract-pink/50 focus:bg-white focus:ring-4";

export function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (!first) return "RC";
  if (!last || parts.length === 1) return first.slice(0, 2).toUpperCase();
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

export type Calendar = {
  id: string;
  title: string;
  type: TypeCalendar;
  date_start: string;
  date_end: string;
  hour_start: string;
  hour_end: string;
  all_day: boolean;
  description: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type CalendarPayload = {
  title: string;
  type: TypeCalendar;
  date_start: string;
  date_end: string;
  hour_start: string;
  hour_end: string;
  all_day: boolean;
  description: string;
  members: string[];
};