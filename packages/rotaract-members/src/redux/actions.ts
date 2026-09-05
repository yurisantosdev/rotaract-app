import type { Dispatch } from "@reduxjs/toolkit";
import { listMembers } from "../services/members";
import type { Member } from "../types/member";
import MembersActionType from "./actionType";
import type { MembersAction, MembersRootState } from "./reduce";

export const membersRequest = (): MembersAction => ({
  type: MembersActionType.MEMBERS_REQUEST,
});

export const membersSuccess = (payload: Member[]): MembersAction => ({
  type: MembersActionType.MEMBERS_SUCCESS,
  payload,
});

export const membersFailure = (payload: string): MembersAction => ({
  type: MembersActionType.MEMBERS_FAILURE,
  payload,
});

export const membersAdd = (payload: Member): MembersAction => ({
  type: MembersActionType.MEMBERS_ADD,
  payload,
});

export const membersUpdate = (payload: Member): MembersAction => ({
  type: MembersActionType.MEMBERS_UPDATE,
  payload,
});

type MembersThunk = (
  dispatch: Dispatch<MembersAction>,
  getState: () => MembersRootState
) => Promise<Member[] | undefined>;

let pendingLoad: Promise<Member[] | undefined> | null = null;

export const membersClean = (): MembersAction => {
  pendingLoad = null;
  return { type: MembersActionType.MEMBERS_CLEAN };
};

export function loadMembers(): MembersThunk {
  return (dispatch, getState) => {
    const current = getState().members;

    if (current.status === "succeeded") {
      return Promise.resolve(current.items);
    }

    if (pendingLoad) {
      return pendingLoad;
    }

    dispatch(membersRequest());

    pendingLoad = listMembers(new AbortController().signal)
      .then((items) => {
        dispatch(membersSuccess(items));
        return items;
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return undefined;
        }

        dispatch(
          membersFailure(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar os membros"
          )
        );
        return undefined;
      })
      .finally(() => {
        pendingLoad = null;
      });

    return pendingLoad;
  };
}
