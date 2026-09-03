export type EventKind = "reuniao" | "projeto" | "evento" | "outro";

export type CalendarEvent = {
  id: string;
  title: string;
  notes?: string;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  kind: EventKind;
  memberIds: string[];
};

export type CalendarEventPayload = {
  title: string;
  notes: string;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  kind: EventKind;
  memberIds: string[];
};

export const EVENT_KINDS: { id: EventKind; label: string }[] = [
  { id: "reuniao", label: "Reunião" },
  { id: "projeto", label: "Projeto" },
  { id: "evento", label: "Evento" },
  { id: "outro", label: "Outro" },
];

export const EVENT_KIND_STYLES: Record<
  EventKind,
  { chip: string; hover: string; dot: string; header: string }
> = {
  reuniao: {
    chip: "bg-rotaract-pink/10 text-rotaract-pink ring-rotaract-pink/20",
    hover: "bg-rotaract-pink text-white ring-rotaract-magenta",
    dot: "bg-rotaract-pink",
    header: "bg-rotaract-pink/10 text-rotaract-pink",
  },
  projeto: {
    chip: "bg-violet-100 text-violet-800 ring-violet-200",
    hover: "bg-violet-500 text-white ring-violet-600",
    dot: "bg-violet-500",
    header: "bg-violet-50 text-violet-800",
  },
  evento: {
    chip: "bg-sky-100 text-sky-800 ring-sky-200",
    hover: "bg-sky-500 text-white ring-sky-600",
    dot: "bg-sky-500",
    header: "bg-sky-50 text-sky-800",
  },
  outro: {
    chip: "bg-zinc-100 text-zinc-800 ring-zinc-200",
    hover: "bg-zinc-500 text-white ring-zinc-600",
    dot: "bg-zinc-500",
    header: "bg-zinc-50 text-zinc-800",
  },
};

export const EVENT_TEXTAREA_CLASS =
  "min-h-[6rem] w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none ring-rotaract-pink/20 transition placeholder:text-zinc-400 focus:border-rotaract-pink/50 focus:bg-white focus:ring-4";

export function eventKindLabel(kind: EventKind): string {
  return EVENT_KINDS.find((item) => item.id === kind)?.label ?? "Evento";
}

export function isEventInMonth(event: CalendarEvent, month: Date): boolean {
  const start = new Date(event.startsAt);
  return (
    start.getFullYear() === month.getFullYear() &&
    start.getMonth() === month.getMonth()
  );
}

export function isUpcomingEvent(event: CalendarEvent, now = new Date()): boolean {
  return new Date(event.startsAt).getTime() >= now.getTime();
}
