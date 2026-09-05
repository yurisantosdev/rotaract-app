import { configureStore } from "@reduxjs/toolkit";
import { membersReducer } from "@rotaract/members";
import { noticesReducer } from "@rotaract/notices";

export function makeStore() {
  return configureStore({
    reducer: {
      members: membersReducer,
      notices: noticesReducer,
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
