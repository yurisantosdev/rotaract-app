"use client";

import { CalendarBlankIcon } from "@phosphor-icons/react";
import { Pagination } from "@rotaract/components";
import { InviteEventCard } from "../InviteEventCard";
import type { CardAcceptProps } from "./types";
import { useCardAccept } from "./services";

export type { CardAcceptProps } from "./types";

export function CardAccept({ currentUserId }: CardAcceptProps) {
  const data = useCardAccept();

  if (!data) return null;

  const {
    title,
    count,
    refreshPendingAccept,
    pagination
  } = data;

  return (
    <section
      className="home-rise mt-8 overflow-hidden rounded-3xl border border-rotaract-pink/20 bg-gradient-to-br from-white via-white to-rotaract-pink/10 p-5 shadow-[0_16px_48px_rgba(255,45,122,0.10)] sm:mt-10 sm:p-6"
      aria-labelledby="card-accept-title"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-rotaract-pink">
          Convite
        </p>

        <span className="shrink-0 rounded-full bg-rotaract-pink px-2.5 py-1 text-[11px] font-semibold text-white">
          {count} {count === 1 ? "pendente" : "pendentes"}
        </span>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rotaract-pink text-white shadow-[0_10px_24px_rgba(255,45,122,0.28)]">
            <CalendarBlankIcon size={24} weight="bold" aria-hidden />
          </span>
          <div className="w-ful">
            <h2
              id="card-accept-title"
              className="mt-1 md:text-lg text-base font-semibold tracking-tight text-zinc-900"
            >
              {title}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Confirme sua presença para o clube se organizar.
            </p>
          </div>
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {pagination.pageItems.map((calendar) => (
          <li key={calendar.id}>
            <InviteEventCard
              calendar={calendar}
              currentUserId={currentUserId}
              onResponded={refreshPendingAccept}
            />
          </li>
        ))}
      </ul>

      <Pagination
        page={pagination.page}
        totalItems={pagination.totalItems}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setPage}
        itemLabel={{ singular: "convite", plural: "convites" }}
        compact
      />
    </section>
  );
}
