"use client";

import { Loading, Main, ReturnModule, TitleModule } from "@rotaract/components";
import { MembersStats } from "./components/membersStats/MembersStats";
import { MembersPanel } from "./components/membersPanel/MembersPanel";
import type { MembersPageProps } from "./types/member";
import { useMembersFunctions } from "./services/members.services";

export function MembersPage({
  userName,
  backHref = "/home",
}: MembersPageProps) {
  const data = useMembersFunctions(userName);
  if (!data) return null;
  const {
    isLoading,
    firstName,
    members,
    handleCreate,
    handleUpdate,
    handleChangeStatus
  } = data;

  return (
    <Main>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {isLoading ? <Loading /> : null}

        <ReturnModule backHref={backHref} />

        <TitleModule
          module="Módulo membros"
          title="Membros"
          description={`Olá, ${firstName}. Gerencie o cadastro, os cargos e a família do clube.`}
        />

        <MembersStats members={members} />
        <MembersPanel
          members={members}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onChangeStatus={handleChangeStatus}
        />
      </main>
    </Main>
  );
}
