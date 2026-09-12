"use client";

import { Member, MemberFilter, MemberPayload, isBirthdayThisMonth, isBoardRole, normalizeSearch } from "../../../src/types/member";
import { usePagination } from "@rotaract/components";
import { useMemo, useState } from "react";
import { UseMembersPanelProps } from "./types";

export function useMembersPanel({
  members,
  onCreate,
  onUpdate,
}: UseMembersPanelProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MemberFilter>("todos");
  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberToToggle, setMemberToToggle] = useState<Member | null>(null);

  const filtered = useMemo(() => {
    const term = normalizeSearch(query);

    return members
      .filter((member) => {
        const matchesFilter =
          filter === "todos" ||
          (filter === "diretoria" ? isBoardRole(member.role) : member.status === filter);
        if (!matchesFilter) return false;
        if (!term) return true;

        return (
          normalizeSearch(member.name).includes(term) ||
          normalizeSearch(member.email).includes(term) ||
          normalizeSearch(member.phone ?? "").includes(term) ||
          normalizeSearch(member.role).includes(term)
        );
      })
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === "ativo" ? -1 : 1;
        return a.name.localeCompare(b.name, "pt-BR");
      });
  }, [filter, members, query]);

  const pagination = usePagination(filtered, {
    resetKey: `${query}|${filter}`,
  });

  const birthdaysThisMonth = useMemo(
    () =>
      members.filter(
        (member) =>
          member.status === "ativo" && isBirthdayThisMonth(member.birthDate)
      ),
    [members]
  );

  function openCreate() {
    setEditingMember(null);
    setFormOpen(true);
  }

  function openEdit(member: Member) {
    setEditingMember(member);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingMember(null);
  }

  function handleSave(payload: MemberPayload) {
    if (editingMember) {
      return onUpdate(editingMember.id, payload);
    }
    return onCreate(payload);
  }

  return {
    openCreate,
    birthdaysThisMonth,
    query,
    setFilter,
    filter,
    setQuery,
    filtered,
    pagination,
    openEdit,
    setMemberToToggle,
    formOpen,
    editingMember,
    closeForm,
    handleSave,
    memberToToggle
  };
}
