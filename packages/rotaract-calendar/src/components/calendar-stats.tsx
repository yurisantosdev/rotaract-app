import type { CalendarEvent } from "../types/event";
import { isEventInMonth, isUpcomingEvent } from "../types/event";
import { isSameDay } from "../lib/dates";

type CalendarStatsProps = {
  events: CalendarEvent[];
};

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 sm:rounded-3xl sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {title}
      </p>
      <p className="mt-2 text-xl font-semibold tabular-nums text-zinc-900 sm:text-2xl">
        {value}
      </p>
      <p className="mt-2 text-sm text-zinc-500">{description}</p>
    </article>
  );
}

export function CalendarStats({ events }: CalendarStatsProps) {
  const now = new Date();
  const thisMonth = events.filter((event) => isEventInMonth(event, now)).length;
  const upcoming = events.filter((event) => isUpcomingEvent(event, now)).length;
  const today = events.filter((event) =>
    isSameDay(new Date(event.startsAt), now)
  ).length;

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
