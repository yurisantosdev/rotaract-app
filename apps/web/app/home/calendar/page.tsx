"use client";

import { CalendarPage } from "@rotaract/calendar";
import { useMemberSession } from "../_components/member-session";

export default function Calendar() {
  const { user } = useMemberSession();
  return (
    <CalendarPage userName={user.name} currentUserId={user.id} backHref="/home" />
  );
}
