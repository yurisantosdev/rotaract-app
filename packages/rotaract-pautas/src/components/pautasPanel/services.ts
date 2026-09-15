"use client";

import { usePagination } from "@rotaract/components";
import { useMemo, useState } from "react";
import { membersByIds } from "../../lib/members";
import {
  getPautaItemProgress,
  matchesPautaFilter,
  normalizeSearch,
  type PautaFilter,
} from "../../types/pautas";
import type { PautasPanelProps } from "./type";

export function usePautasPanel({
  pautas,
  members,
}: PautasPanelProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<PautaFilter>("todos");
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => {
    const term = normalizeSearch(query);

    return pautas
      .map((pauta) => ({
        pauta,
        progress: getPautaItemProgress(pauta.items),
        present: membersByIds(members, pauta.presentMemberIds),
      }))
      .filter((item) => {
        if (!matchesPautaFilter(item.pauta, filter)) return false;
        if (!term) return true;
        return (
          normalizeSearch(item.pauta.title).includes(term) ||
          normalizeSearch(item.pauta.notes).includes(term) ||
          item.present.some((member) => normalizeSearch(member.name).includes(term))
        );
      })
      .sort((a, b) => b.pauta.meetingDate.localeCompare(a.pauta.meetingDate));
  }, [filter, members, pautas, query]);

  const pagination = usePagination(filtered, {
    resetKey: `${query}|${filter}`,
  });

  return {
    query,
    setQuery,
    filter,
    setFilter,
    filtered,
    pagination,
    setFormOpen,
    formOpen,
  };
}
