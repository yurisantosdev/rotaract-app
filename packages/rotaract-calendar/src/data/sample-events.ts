import { addDays } from "../lib/dates";
import type { CalendarEvent } from "../types/event";

function at(date: Date, hour: number, minute = 0): string {
  const value = new Date(date);
  value.setHours(hour, minute, 0, 0);
  return value.toISOString();
}

function pick(ids: string[], offset: number, count: number): string[] {
  if (ids.length === 0) return [];
  return Array.from({ length: Math.min(count, ids.length) }, (_, index) => {
    return ids[(offset + index) % ids.length] ?? "";
  }).filter(Boolean);
}

export function buildSampleEvents(memberIds: string[] = []): CalendarEvent[] {
  const today = new Date();
  const inTwoDays = addDays(today, 2);
  const inFiveDays = addDays(today, 5);
  const inTenDays = addDays(today, 10);
  const lastWeek = addDays(today, -5);

  return [
    {
      id: "evt-alinhamento",
      title: "Alinhamento da diretoria",
      notes: "Pauta rápida sobre o calendário do mês e pendências da tesouraria.",
      startsAt: at(today, 14, 0),
      endsAt: at(today, 15, 0),
      allDay: false,
      kind: "compromisso",
      memberIds: pick(memberIds, 0, 3),
    },
    {
      id: "evt-reuniao-ordinaria",
      title: "Reunião ordinária",
      notes: "Reunião semanal do clube. Confirmar presença até o meio-dia.",
      startsAt: at(inTwoDays, 19, 30),
      endsAt: at(inTwoDays, 21, 0),
      allDay: false,
      kind: "reuniao",
      memberIds: pick(memberIds, 0, Math.min(6, Math.max(memberIds.length, 1))),
    },
    {
      id: "evt-acao-arrecadacao",
      title: "Ação de arrecadação",
      notes: "Coleta de alimentos na praça central. Levar coletes e banners.",
      startsAt: at(inFiveDays, 9, 0),
      endsAt: at(inFiveDays, 12, 0),
      allDay: false,
      kind: "projeto",
      memberIds: pick(memberIds, 1, 4),
    },
    {
      id: "evt-happy-hour",
      title: "Happy hour com o Rotary",
      notes: "Encontro informal para aproximar as duas casas.",
      startsAt: at(lastWeek, 19, 0),
      endsAt: at(lastWeek, 21, 30),
      allDay: false,
      kind: "evento",
      memberIds: pick(memberIds, 2, 5),
    },
    {
      id: "evt-mutirao",
      title: "Mutirão no asilo",
      notes: "Tarde de convivência e organização do espaço.",
      startsAt: at(inTenDays, 8, 0),
      endsAt: at(inTenDays, 12, 0),
      allDay: false,
      kind: "projeto",
      memberIds: pick(memberIds, 0, 4),
    },
  ];
}
