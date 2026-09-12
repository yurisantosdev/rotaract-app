"use client";

import { currentMonthLabel } from "../../../src/types/member";
import { BirthdayBannerProps } from "./type";

export function useBirthdayBanner({ members }: BirthdayBannerProps) {
  function firstName(name: string) {
    return name.trim().split(/\s+/).filter(Boolean)[0] || name;
  }

  function isBirthdayToday(value?: string) {
    if (!value) return false;
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return false;
    const now = new Date();
    return date.getDate() === now.getDate() && date.getMonth() === now.getMonth();
  }

  function birthDay(value?: string) {
    if (!value) return 0;
    return Number(value.slice(8, 10)) || 0;
  }

  const sorted = [...members].sort((a, b) => birthDay(a.birthDate) - birthDay(b.birthDate));
  const todayCount = sorted.filter((member) => isBirthdayToday(member.birthDate)).length;
  const month = currentMonthLabel();

  return {
    firstName,
    isBirthdayToday,
    birthDay,
    month,
    todayCount,
    sorted,
  };
}
