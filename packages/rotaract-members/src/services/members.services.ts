import { useDispatch } from "react-redux";
import { Member, MemberPayload, membersAdd, membersUpdate, useMembers, useMembersStatus } from "..";
import { createMembers, updateMembers } from "./database.members.services";
import { AlertError, AlertSuccess } from "@rotaract/components";

export function useMembersFunctions(userName: string) {
  const dispatch = useDispatch();
  const members = useMembers();
  const membersStatus = useMembersStatus();
  const firstName = userName.split(" ")[0] || userName;
  const isLoading = membersStatus === "idle" || membersStatus === "loading";

  function handleCreate(payload: MemberPayload) {
    const controller = new AbortController();

    return createMembers(controller.signal, payload).then((created) => {
      dispatch(membersAdd(created));
      AlertSuccess("Membro salvo com sucesso");
    });
  }

  function handleUpdate(id: string, payload: MemberPayload) {
    const controller = new AbortController();

    return updateMembers(id, controller.signal, payload).then((updated) => {
      AlertSuccess("Membro atualizado com sucesso");
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
        AlertSuccess("Membro atualizado com sucesso");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          AlertError("Não foi possível atualizar o membro.");
          return;
        }
      });
  }

  return {
    isLoading,
    firstName,
    members,
    handleCreate,
    handleUpdate,
    handleChangeStatus
  };
}
