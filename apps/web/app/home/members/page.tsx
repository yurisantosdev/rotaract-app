"use client";

import { MembersPage } from "@rotaract/members";
import { useMemberSession } from "../_components/member-session";

export default function MembrosPage() {
  const { user } = useMemberSession();
  return <MembersPage userName={user.name} backHref="/home" />;
}
