"use client";

import { ArrowRightIcon, CalendarBlankIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { EmptyState } from "../EmptyState";
import { EventRow } from "../EventRow";
import { UpcomingEventsProps } from "./types";
import { AgendaSkeleton } from "./_components/AgendaSkeleton";
import { OverflowLabel } from "./_components/OverflowLabel";
import { useUpcomingEvents } from "./services";

export function UpcomingEvents({
  calendarHref = "/home/calendar",
}: UpcomingEventsProps) {

  const data = useUpcomingEvents();
  if (!data) return null;
  const {
    state,
    todayEvents,
    visibleTodayEvents,
    now,
    todayOverflow,
    upcomingCount,
    upcomingGroups,
    visibleUpcoming,
    formatGroupDate,
    tomorrow
  } = data;

  return (
    <section
      className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-[0_12px_40px_rgba(24,24,27,0.04)] sm:p-6"
      aria-labelledby="upcoming-events-title"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rotaract-pink/10 text-rotaract-pink">
            <CalendarBlankIcon size={24} weight="bold" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-rotaract-pink">
              Agenda
            </p>
            <h2
              id="upcoming-events-title"
              className="mt-1 text-lg font-semibold tracking-tight text-zinc-900"
            >
              Hoje e próximos 7 dias
            </h2>
          </div>
        </div>

        <Link
          href={calendarHref}
          className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-rotaract-pink"
        >
          Ver agenda
          <ArrowRightIcon
            size={16}
            weight="bold"
            className="transition group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>

      <div className="mt-5">
        {state === "loading" ? <AgendaSkeleton /> : null}

        {state === "error" ? (
          <p className="text-sm text-rose-700" role="alert">
            Não foi possível carregar os agendamentos.
          </p>
        ) : null}

        {state === "ready" ? (
          <div className="grid gap-6 sm:grid-cols-2 sm:items-start sm:gap-8">
            <div>
              <div className="flex h-6 items-center justify-between gap-2">
                <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Hoje
                </h3>
                <span className="rounded-full bg-rotaract-pink/10 px-2 py-0.5 text-[11px] font-semibold text-rotaract-pink">
                  {todayEvents.length}
                </span>
              </div>
              {todayEvents.length === 0 ? (
                <div className="mt-3">
                  <EmptyState message="Nenhum compromisso hoje." />
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  <ul className="space-y-2">
                    {visibleTodayEvents.map((event) => (
                      <EventRow key={event.id} event={event} now={now} />
                    ))}
                  </ul>
                  {OverflowLabel(todayOverflow)}
                </div>
              )}
            </div>

            <div className="sm:border-l sm:border-zinc-100 sm:pl-8">
              <div className="flex h-6 items-center justify-between gap-2">
                <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Próximos 7 dias
                </h3>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-600">
                  {upcomingCount}
                </span>
              </div>
              {upcomingGroups.length === 0 ? (
                <div className="mt-3">
                  <EmptyState message="Nada agendado nos próximos 7 dias." />
                </div>
              ) : (
                <div className="mt-3 space-y-2">
                  <ul className="space-y-2">
                    {visibleUpcoming.groups.flatMap((group) =>
                      group.events.map((event) => (
                        <EventRow
                          key={`${group.day.toISOString()}-${event.id}`}
                          event={event}
                          now={now}
                          dateLabel={formatGroupDate(group.day, tomorrow)}
                        />
                      ))
                    )}
                  </ul>
                  {OverflowLabel(visibleUpcoming.overflow)}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
