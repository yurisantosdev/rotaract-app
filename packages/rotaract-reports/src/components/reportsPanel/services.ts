"use client";

import { useMemo, useState } from "react";
import {
  type Reports,
  type ReportsFilter,
} from "../../types/reports";
import type { ReportsPanelProps } from "./type";

export function useReportsPanel({
  reports,
  onRemove,
}: Pick<ReportsPanelProps, "reports" | "onRemove">) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ReportsFilter>("todos");
  const [editing, setEditing] = useState<Reports | null>(null);
  const [reportToRemove, setReportToRemove] = useState<Reports | null>(null);
  const [removing, setRemoving] = useState(false);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return reports.filter((item) => {
      const matchesFilter = filter === "todos" || item.status === filter;
      const matchesQuery =
        !normalized ||
        item.description.toLowerCase().includes(normalized) ||
        item.date.toLowerCase().includes(normalized);
      return matchesFilter && matchesQuery;
    });
  }, [reports, filter, query]);

  function closeForm() {
    setEditing(null);
  }

  async function confirmRemove() {
    if (!reportToRemove) return;
    setRemoving(true);
    try {
      await onRemove(reportToRemove.id);
      setReportToRemove(null);
    } finally {
      setRemoving(false);
    }
  }

  return {
    query,
    setQuery,
    filter,
    setFilter,
    filtered,
    editing,
    setEditing,
    formOpen: Boolean(editing),
    closeForm,
    reportToRemove,
    setReportToRemove,
    removing,
    confirmRemove,
  };
}
