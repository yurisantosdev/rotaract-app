"use client";

import { useEffect, useState } from "react";
import { CheckCircleIcon } from "@phosphor-icons/react";
import { Loading, ReturnModule, TitleModule } from "@rotaract/components";
import { MembersStats } from "./components/members-stats";
import { MembersPanel } from "./components/members-panel";
import type { Member, MemberPayload } from "./types/member";
import { createMembers, listMembers, updateMembers } from "./services/members";

export type MembersPageProps = {
  userName: string;
  backHref?: string;
};

export function MembersPage({
  userName,
  backHref = "/home",
}: MembersPageProps) {
  const firstName = userName.split(" ")[0] || userName;
  const [members, setMembers] = useState<Member[]>([]);
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  function handleCreate(payload: MemberPayload) {
    const controller = new AbortController();

    return createMembers(controller.signal, payload).then((created) => {
      setMembers((current) => [created, ...current]);
      setNotice("Membro cadastrado.");
    });
  }

  function handleUpdate(id: string, payload: MemberPayload) {
    const controller = new AbortController();

    return updateMembers(id, controller.signal, payload).then((updated) => {
      setMembers((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
      setNotice("Dados do membro atualizados.");
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
        setMembers((current) =>
          current.map((item) => (item.id === updated.id ? updated : item))
        );
        setNotice(
          nextStatus === "inativo"
            ? "Membro marcado como inativo."
            : "Membro reativado."
        );
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setNotice("Não foi possível alterar o status do membro.");
      });
  }

  useEffect(() => {
    const controller = new AbortController();

    void Promise.all([
      listMembers(controller.signal)
        .then(setMembers)
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
          setMembers([]);
        }),
    ]).finally(() => {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    });

    return () => controller.abort();
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {isLoading ? <Loading /> : null}

      <ReturnModule backHref={backHref} />

      <TitleModule
        module="Módulo membros"
        title="Membros"
        description={`Olá, ${firstName}. Gerencie o cadastro, os cargos e a família do clube.`}
      />

      {notice ? (
        <p
          className="mt-5 inline-flex items-center gap-1.5 text-sm text-emerald-700"
          role="status"
        >
          <CheckCircleIcon size={16} weight="fill" aria-hidden />
          {notice}
        </p>
      ) : null}

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
