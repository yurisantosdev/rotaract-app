"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_PAGE_SIZE,
  type UsePaginationOptions,
} from "../types/pagination";

export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {}
) {
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
  const [page, setPage] = useState(1);
  const [seenResetKey, setSeenResetKey] = useState(options.resetKey);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const resetChanged = options.resetKey !== seenResetKey;

  if (resetChanged) {
    setSeenResetKey(options.resetKey);
    setPage(1);
  }

  const currentPage = Math.min(Math.max(1, resetChanged ? 1 : page), totalPages);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [currentPage, items, pageSize]);

  function goToPage(next: number) {
    setPage(Math.min(Math.max(1, next), totalPages));
  }

  return {
    page: currentPage,
    setPage: goToPage,
    pageItems,
    pageSize,
    totalItems,
    totalPages,
  };
}
