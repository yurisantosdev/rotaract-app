"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AuthUser } from "../../lib/types";

type MemberSession = {
  user: AuthUser;
};

const MemberSessionContext = createContext<MemberSession | null>(null);

export function MemberSessionProvider({
  user,
  children,
}: {
  user: AuthUser;
  children: ReactNode;
}) {
  return (
    <MemberSessionContext.Provider value={{ user }}>
      {children}
    </MemberSessionContext.Provider>
  );
}

export function useMemberSession(): MemberSession {
  const session = useContext(MemberSessionContext);
  if (!session) {
    throw new Error("useMemberSession precisa estar dentro de /home");
  }
  return session;
}
