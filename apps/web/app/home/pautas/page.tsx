"use client";

import { PautasPage } from "@rotaract/pautas";
import { useMemberSession } from "../_components/member-session";

export default function PautasRoutePage() {
  const { user } = useMemberSession();

  return (
    <PautasPage
      userName={user.name}
      currentUserId={user.id}
      backHref="/home"
    />
  );
}
