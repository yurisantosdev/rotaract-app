"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { CheckCircleIcon } from "@phosphor-icons/react";
import { Loading, ReturnModule, TitleModule } from "@rotaract/components";
import { MembersStats } from "./components/members-stats";
import { MembersPanel } from "./components/members-panel";
import type { Member, MemberPayload } from "./types/member";
import { membersAdd, membersUpdate } from "./redux/actions";
import { useMembers, useMembersStatus } from "./redux/hooks";
import { createMembers, updateMembers } from "./services/members";

export type MembersPageProps = {
  userName: string;
  backHref?: string;
};

export function MembersPage({
  userName,
  backHref = "/home",
}: MembersPageProps) {
  const dispatch = useDispatch();
  const members = useMembers();
  const membersStatus = useMembersStatus();
  const firstName = userName.split(" ")[0] || userName;
  const isLoading = membersStatus === "idle" || membersStatus === "loading";

  function handleCreate(payload: MemberPayload) {
    const controller = new AbortController();

    return createMembers(controller.signal, payload).then((created) => {
      dispatch(membersAdd(created));
    });
  }

  function handleUpdate(id: string, payload: MemberPayload) {
    const controller = new AbortController();

    return updateMembers(id, controller.signal, payload).then((updated) => {
      dispatch(membersUpdate(updated));
    });
  }

  function handleChangeStatus(member: Member) {
    const nextStatus = member.status === "ativo" ? "inativo" : "ativo";
    const controller = new AbortController();

    void updateMembers(member.id, controller.signal, {
      name: member.name,
      email: member.email,
      phone: member.phone ?? "",
      photo: member.photo ?? "",
      birthDate: member.birthDate ?? "",
      role: member.role,
      status: nextStatus,
    })
      .then((updated) => {
        dispatch(membersUpdate(updated));
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      });
  }

  return (
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
  );
}
