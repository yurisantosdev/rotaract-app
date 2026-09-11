"use client";

import { CalendarStatsProps } from "./types";
import { StatCard } from "./_components/StatCard";
import { useCalendarStats } from "./services";

export default function CalendarStats({ events }: CalendarStatsProps) {
  const {
    now,
    thisMonth,
    upcoming,
    today
  } = useCalendarStats({ events });

  return (
    <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        title="Eventos"
        value={events.length}
        description="Cadastrados na agenda"
      />
      <StatCard
        title="Neste mês"
        value={thisMonth}
        description="Compromissos do mês atual"
      />
      <StatCard
        title="Próximos"
        value={upcoming}
        description="Ainda pela frente"
      />
      <StatCard
        title="Hoje"
        value={today}
        description="Na agenda de hoje"
      />
    </section>
  );
}
