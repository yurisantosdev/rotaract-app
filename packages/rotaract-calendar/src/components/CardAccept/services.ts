"use client";

import { listCalendarPendingAccept } from "../../services/database.services";
import { Calendar } from "../../types/calendar";
import { usePagination } from "@rotaract/components";
import { useCallback, useEffect, useState } from "react";

export function useCardAccept() {
  const [pendingCalendars, setPendingCalendars] = useState<Calendar[]>([]);
  const [ready, setReady] = useState(false);
  const pagination = usePagination(pendingCalendars);

  const loadPendingAccept = useCallback((signal: AbortSignal) => {
    return listCalendarPendingAccept(signal)
      .then((list) => {
        if (signal.aborted) return;
        setPendingCalendars(list);
        setReady(true);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setPendingCalendars([]);
        setReady(true);
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadPendingAccept(controller.signal);
    return () => controller.abort();
  }, [loadPendingAccept]);

  async function refreshPendingAccept() {
    const controller = new AbortController();
    await loadPendingAccept(controller.signal);
  }

  if (!ready || pendingCalendars.length === 0) {
    return null;
  }

  const count = pendingCalendars.length;
  const title =
    count === 1 ? "Novo convite para você" : "Novos convites para você";

  return {
    title,
    count,
    refreshPendingAccept,
    pagination
  };
}
