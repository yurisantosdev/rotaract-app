"use client";

import { isBoardRole } from "../../../src/types/member";
import { MembersStatsProps } from "./type";

export function useMembersStats({ members }: MembersStatsProps) {
  const active = members.filter((member) => member.status === "ativo").length;
  const board = members.filter((member) => isBoardRole(member.role)).length;
  const inactive = members.filter((member) => member.status === "inativo").length;

  return {
    active,
    board,
    inactive
  };
}
