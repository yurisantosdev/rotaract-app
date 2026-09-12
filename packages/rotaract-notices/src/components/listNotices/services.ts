"use client";

import { usePagination } from "@rotaract/components";
import { ListNoticesProps } from "./type";

export function useListNotices({ notices }: ListNoticesProps) {
  const pagination = usePagination(notices);

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

  return {
    formatNoticeDate,
    pagination
  };
}
