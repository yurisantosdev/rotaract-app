"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  findMemberByAccount,
  uniqueMemberManagements,
  useMembers,
  useMembersStatus,
} from "@rotaract/members";
import { listSettings } from "../../../services/database.settings.services";

const VIEWING_MANAGEMENT_KEY = "rotaract-viewing-management";

type ViewingManagementContextValue = {
  viewingManagement: string;
  setViewingManagement: (name: string) => void;
  viewingOptions: string[];
};

const ViewingManagementContext =
  createContext<ViewingManagementContextValue | null>(null);

function readSessionViewing(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(VIEWING_MANAGEMENT_KEY)?.trim() ?? "";
}

function writeSessionViewing(name: string) {
  if (typeof window === "undefined") return;
  if (!name) {
    sessionStorage.removeItem(VIEWING_MANAGEMENT_KEY);
    return;
  }
  sessionStorage.setItem(VIEWING_MANAGEMENT_KEY, name);
}

export function clearViewingManagementSession() {
  writeSessionViewing("");
}

function pickViewingManagement(
  stored: string,
  official: string,
  memberManagements: string[]
): string {
  if (stored && memberManagements.includes(stored)) {
    return stored;
  }

  if (official && memberManagements.includes(official)) {
    return official;
  }

  return memberManagements[0] || "";
}

export function ViewingManagementProvider({
  children,
  userId,
  userEmail,
}: {
  children: ReactNode;
  userId: string;
  userEmail: string;
}) {
  const members = useMembers();
  const membersStatus = useMembersStatus();
  const loggedMember = useMemo(
    () => findMemberByAccount(members, { id: userId, email: userEmail }),
    [members, userEmail, userId]
  );
  const viewingOptions = useMemo(
    () => uniqueMemberManagements(loggedMember ? [loggedMember] : []),
    [loggedMember]
  );
  const [officialManagement, setOfficialManagement] = useState("");
  const [settingsReady, setSettingsReady] = useState(false);
  const [viewingManagement, setViewingManagementState] = useState("");

  const setViewingManagement = useCallback((name: string) => {
    const next = name.trim();
    setViewingManagementState(next);
    writeSessionViewing(next);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    listSettings(controller.signal)
      .then((items) => {
        const official = items[0]?.currentManagement?.trim() ?? "";
        setOfficialManagement(official);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!controller.signal.aborted) setSettingsReady(true);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!settingsReady) return;
    if (membersStatus === "idle" || membersStatus === "loading") return;

    const stored = readSessionViewing();
    const next = pickViewingManagement(
      stored,
      officialManagement,
      viewingOptions
    );
    setViewingManagementState(next);
    if (stored) writeSessionViewing(next);
  }, [membersStatus, officialManagement, settingsReady, viewingOptions]);

  const value = useMemo(
    () => ({ viewingManagement, setViewingManagement, viewingOptions }),
    [setViewingManagement, viewingManagement, viewingOptions]
  );

  return (
    <ViewingManagementContext.Provider value={value}>
      {children}
    </ViewingManagementContext.Provider>
  );
}

export function useViewingManagement(): ViewingManagementContextValue {
  const context = useContext(ViewingManagementContext);
  if (!context) {
    throw new Error(
      "useViewingManagement precisa estar dentro de ViewingManagementProvider"
    );
  }
  return context;
}

export function useOptionalViewingManagement(): ViewingManagementContextValue | null {
  return useContext(ViewingManagementContext);
}
