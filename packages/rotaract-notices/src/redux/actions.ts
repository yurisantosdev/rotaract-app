import type { Dispatch } from "@reduxjs/toolkit";
import { listNotices } from "../services/notices";
import type { Notices } from "../types/notices";
import NoticesActionType from "./actionType";
import type { NoticesAction, NoticesRootState } from "./reduce";

export const noticesRequest = (): NoticesAction => ({
  type: NoticesActionType.NOTICES_REQUEST,
});

export const noticesSuccess = (payload: Notices[]): NoticesAction => ({
  type: NoticesActionType.NOTICES_SUCCESS,
  payload,
});

export const noticesFailure = (payload: string): NoticesAction => ({
  type: NoticesActionType.NOTICES_FAILURE,
  payload,
});

export const noticesAdd = (payload: Notices): NoticesAction => ({
  type: NoticesActionType.NOTICES_ADD,
  payload,
});

export const noticesUpdate = (payload: Notices): NoticesAction => ({
  type: NoticesActionType.NOTICES_UPDATE,
  payload,
});

type NoticesThunk = (
  dispatch: Dispatch<NoticesAction>,
  getState: () => NoticesRootState
) => Promise<Notices[] | undefined>;

let pendingLoad: Promise<Notices[] | undefined> | null = null;

export const noticesClean = (): NoticesAction => {
  pendingLoad = null;
  return { type: NoticesActionType.NOTICES_CLEAN };
};

export function loadNotices(): NoticesThunk {
  return (dispatch, getState) => {
    const current = getState().notices;

    if (current.status === "succeeded") {
      return Promise.resolve(current.items);
    }

    if (pendingLoad) {
      return pendingLoad;
    }

    dispatch(noticesRequest());

    pendingLoad = listNotices(new AbortController().signal)
      .then((items) => {
        dispatch(noticesSuccess(items));
        return items;
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return undefined;
        }

        dispatch(
          noticesFailure(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar as notificações"
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
