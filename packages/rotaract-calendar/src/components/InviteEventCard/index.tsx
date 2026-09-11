"use client";

import { CheckIcon, ClockIcon, XIcon } from "@phosphor-icons/react";
import { Button } from "@rotaract/components";
import {
  eventKindLabel,
} from "../../types/event";
import { InviteEventCardProps } from "./types";
import { useInviteEventCard } from "./services";

export function InviteEventCard({
  calendar,
  currentUserId,
  onResponded,
}: InviteEventCardProps) {
  const data = useInviteEventCard({ calendar, currentUserId, onResponded });
  if (!data) return null;
  const {
    formatInviteWhen,
    event,
    date,
    kindStyles,
    error,
    busy,
    respond,
    action
  } = data;

  return (
    <article
      className="flex flex-col gap-4 rounded-2xl border border-rotaract-pink/15 bg-white p-4 shadow-[0_8px_24px_rgba(255,45,122,0.06)] sm:flex-row sm:items-center sm:gap-5 sm:p-5"
      aria-label={`Convite: ${event.title}`}
    >
      <div
        className="flex h-[4.5rem] w-[3.75rem] shrink-0 flex-col items-center justify-center rounded-2xl bg-rotaract-pink text-white shadow-[0_10px_24px_rgba(255,45,122,0.28)]"
        aria-hidden
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
          {date.month}
        </span>
        <span className="text-[1.65rem] font-semibold leading-none tracking-tight">
          {date.day}
        </span>
        <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-white/80">
          {date.weekday}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-base font-semibold tracking-tight text-zinc-900">
            {event.title}
          </h3>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${kindStyles.chip}`}
          >
            {eventKindLabel(event.kind)}
          </span>
        </div>

        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-zinc-500">
          <ClockIcon size={14} weight="bold" className="shrink-0 text-rotaract-pink" aria-hidden />
          <span className="truncate">{formatInviteWhen(event)}</span>
        </p>

        {event.notes ? (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-zinc-500">
            {event.notes}
          </p>
        ) : null}

        {error ? (
          <p className="mt-2 text-sm text-rose-700" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex w-full shrink-0 gap-2 sm:w-auto sm:min-w-[13.5rem]">
        <button
          type="button"
          disabled={busy}
          onClick={() => void respond("rejected")}
          className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-100 disabled:cursor-wait disabled:opacity-70 sm:flex-none"
        >
          {action === "rejected" ? (
            <span
              className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600"
              aria-hidden
            />
          ) : (
            <XIcon size={16} weight="bold" aria-hidden />
          )}
          Recusar
        </button>
        <Button
          title="Aceitar"
          icon={<CheckIcon size={16} weight="bold" aria-hidden />}
          loading={action === "accepted"}
          disabled={busy}
          onClick={() => void respond("accepted")}
          className="flex-1 sm:flex-none"
        />
      </div>
    </article>
  );
}
