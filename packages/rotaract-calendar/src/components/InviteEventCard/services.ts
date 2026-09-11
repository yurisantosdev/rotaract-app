"use client";

import { calendarToEvent } from "@/src/lib/calendar-event";
import { formatEventTimeRange, isSameDay } from "@/src/lib/dates";
import { respondToCalendarInvite } from "@/src/services/database.services";
import { CalendarEvent, EVENT_KIND_STYLES } from "@/src/types/event";
import { AlertSuccess } from "@rotaract/components";
import { useState } from "react";
import { InviteEventCardProps } from "./types";

export function useInviteEventCard({
  calendar,
  currentUserId,
  onResponded,
}: InviteEventCardProps) {
  function capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function inviteDateParts(iso: string) {
    const date = new Date(iso);
    return {
      weekday: capitalize(
        date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")
      ),
      day: String(date.getDate()).padStart(2, "0"),
      month: capitalize(
        date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")
      ),
    };
  }

  function formatInviteWhen(event: CalendarEvent): string {
    const start = new Date(event.startsAt);
    const end = new Date(event.endsAt);
    const time = formatEventTimeRange(event.startsAt, event.endsAt, event.allDay);

    if (isSameDay(start, end)) return time;

    const endDay = end.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
    });

    return `${time} · até ${endDay}`;
  }

  const [action, setAction] = useState<"accepted" | "rejected" | null>(null);
  const [error, setError] = useState("");
  const event = calendarToEvent(calendar);
  const date = inviteDateParts(event.startsAt);
  const kindStyles = EVENT_KIND_STYLES[event.kind] ?? EVENT_KIND_STYLES.outro;
  const busy = action !== null;

  async function respond(accept: "accepted" | "rejected") {
    if (busy) return;

    const controller = new AbortController();
    setAction(accept);
    setError("");

    try {
      await respondToCalendarInvite(calendar, currentUserId, accept, controller.signal);
      await onResponded();

      AlertSuccess(`Convite ${accept === "accepted" ? "aceito" : "recusado"} com sucesso`);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar o convite."
      );
      setAction(null);
    }
  }

  return {
    formatInviteWhen,
    event,
    date,
    kindStyles,
    error,
    busy,
    respond,
    action
  };
}
