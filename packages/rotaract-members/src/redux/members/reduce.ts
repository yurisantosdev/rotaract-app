import type { UnknownAction } from "@reduxjs/toolkit";
import type { Member } from "../../types/member";
import MembersActionType from "./actionType";

export type MembersStatus = "idle" | "loading" | "succeeded" | "failed";

export type MembersState = {
  items: Member[];
  status: MembersStatus;
  error: string | null;
};

export type MembersRootState = {
  members: MembersState;
};

export type MembersAction =
  | { type: typeof MembersActionType.MEMBERS_REQUEST }
  | { type: typeof MembersActionType.MEMBERS_SUCCESS; payload: Member[] }
  | { type: typeof MembersActionType.MEMBERS_FAILURE; payload: string }
  | { type: typeof MembersActionType.MEMBERS_ADD; payload: Member }
  | { type: typeof MembersActionType.MEMBERS_UPDATE; payload: Member }
  | { type: typeof MembersActionType.MEMBERS_CLEAN };

const initialState: MembersState = {
  items: [],
  status: "idle",
  error: null,
};

function asMember(value: unknown): Member {
  return value as Member;
}

function asMemberList(value: unknown): Member[] {
  return Array.isArray(value) ? (value as Member[]) : [];
}

const membersReducer = (
  state: MembersState = initialState,
  action: UnknownAction
): MembersState => {
  switch (action.type) {
    case MembersActionType.MEMBERS_REQUEST:
      return {
        ...state,
        status: "loading",
        error: null,
      };

    case MembersActionType.MEMBERS_SUCCESS:
      return {
        items: asMemberList(action.payload),
        status: "succeeded",
        error: null,
      };

    case MembersActionType.MEMBERS_FAILURE:
      return {
        ...state,
        status: "failed",
        error: typeof action.payload === "string" ? action.payload : "Não foi possível carregar os membros",
      };

    case MembersActionType.MEMBERS_ADD: {
      const member = asMember(action.payload);
      return {
        ...state,
        items: [member, ...state.items.filter((item) => item.id !== member.id)],
      };
    }

    case MembersActionType.MEMBERS_UPDATE: {
      const member = asMember(action.payload);
      return {
        ...state,
        items: state.items.map((item) => (item.id === member.id ? member : item)),
      };
    }

    case MembersActionType.MEMBERS_CLEAN:
      return initialState;

    default:
      return state;
  }
};

export const selectMembersState = (state: MembersRootState): MembersState =>
  state.members;

export const selectMembers = (state: MembersRootState): Member[] =>
  state.members.items;

export const selectMembersStatus = (state: MembersRootState): MembersStatus =>
  state.members.status;

export const selectMembersError = (state: MembersRootState): string | null =>
  state.members.error;

export default membersReducer;
