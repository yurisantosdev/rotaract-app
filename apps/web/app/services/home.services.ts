"use client";

import { useEffect, useState } from "react";
import { useMemberSession } from "../home/_components/member-session";

export function useHome() {
  function greetingForHour(hour: number) {
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  }

  function formatToday(date: Date) {
    const formatted = date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  function initialsFromName(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const first = parts[0];
    const last = parts[parts.length - 1];
    if (!first) return "RC";
    if (!last || parts.length === 1) return first.slice(0, 2).toUpperCase();
    return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
  }

  const { user } = useMemberSession();
  const [now, setNow] = useState<Date | null>(null);
  const firstName = user.name.split(" ")[0] || user.name;

  useEffect(() => {
    setNow(new Date());
  }, []);

  return {
    user,
    now,
    firstName,
    initialsFromName,
    greetingForHour,
    formatToday
  };
}
