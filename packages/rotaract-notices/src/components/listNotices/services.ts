"use client";

import { useState } from "react";
import { usePagination } from "@rotaract/components";
import { ListNoticesProps } from "./type";

export function useListNotices({ notices }: ListNoticesProps) {
  const pagination = usePagination(notices);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function formatNoticeDate(value: string) {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function toggleExpanded(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  return {
    formatNoticeDate,
    pagination,
    expandedId,
    toggleExpanded,
  };
}
