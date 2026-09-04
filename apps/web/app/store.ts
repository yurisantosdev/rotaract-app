import { configureStore } from "@reduxjs/toolkit";
import { membersReducer } from "@rotaract/members";

export function makeStore() {
  return configureStore({
    reducer: {
      members: membersReducer,
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
