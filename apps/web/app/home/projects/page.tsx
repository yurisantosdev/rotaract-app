"use client";

import { ProjectsPage } from "@rotaract/projects";
import { useMemberSession } from "../_components/member-session";

export default function ProjetosPage() {
  const { user } = useMemberSession();
  return (
    <ProjectsPage
      userName={user.name}
      currentUserId={user.id}
      backHref="/home"
    />
  );
}
