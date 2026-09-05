import type { UnknownAction } from "@reduxjs/toolkit";
import type { Notices } from "../types/notices";
import NoticesActionType from "./actionType";

export type NoticesStatus = "idle" | "loading" | "succeeded" | "failed";

export type NoticesState = {
  items: Notices[];
  status: NoticesStatus;
  error: string | null;
};

export type NoticesRootState = {
  notices: NoticesState;
};

export type NoticesAction =
  | { type: typeof NoticesActionType.NOTICES_REQUEST }
  | { type: typeof NoticesActionType.NOTICES_SUCCESS; payload: Notices[] }
  | { type: typeof NoticesActionType.NOTICES_FAILURE; payload: string }
  | { type: typeof NoticesActionType.NOTICES_ADD; payload: Notices }
  | { type: typeof NoticesActionType.NOTICES_UPDATE; payload: Notices }
  | { type: typeof NoticesActionType.NOTICES_CLEAN };

const initialState: NoticesState = {
  items: [],
  status: "idle",
  error: null,
};

function asNotice(value: unknown): Notices {
  return value as Notices;
}

function asNoticeList(value: unknown): Notices[] {
  return Array.isArray(value) ? (value as Notices[]) : [];
}

const noticesReducer = (
  state: NoticesState = initialState,
  action: UnknownAction
): NoticesState => {
  switch (action.type) {
    case NoticesActionType.NOTICES_REQUEST:
      return {
        ...state,
        status: "loading",
        error: null,
      };

    case NoticesActionType.NOTICES_SUCCESS:
      return {
        items: asNoticeList(action.payload),
        status: "succeeded",
        error: null,
      };

    case NoticesActionType.NOTICES_FAILURE:
      return {
        ...state,
        status: "failed",
        error:
          typeof action.payload === "string"
            ? action.payload
            : "Não foi possível carregar as notificações",
      };

    case NoticesActionType.NOTICES_ADD: {
      const notice = asNotice(action.payload);
      return {
        ...state,
        items: [notice, ...state.items.filter((item) => item.id !== notice.id)],
      };
    }

    case NoticesActionType.NOTICES_UPDATE: {
      const notice = asNotice(action.payload);
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === notice.id ? notice : item
        ),
      };
    }

    case NoticesActionType.NOTICES_CLEAN:
      return initialState;

    default:
      return state;
  }
};

export const selectNoticesState = (state: NoticesRootState): NoticesState =>
  state.notices;

export const selectNotices = (state: NoticesRootState): Notices[] =>
  state.notices.items;

export const selectNoticesStatus = (state: NoticesRootState): NoticesStatus =>
  state.notices.status;

export const selectNoticesError = (state: NoticesRootState): string | null =>
  state.notices.error;

export default noticesReducer;
