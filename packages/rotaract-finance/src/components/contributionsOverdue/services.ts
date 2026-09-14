"use client";

import { useMembersStatus } from "@rotaract/members";
import { useViewingManagement } from "@rotaract/settings";
import { listContributionsOverdue } from "../../../src/services/database.contributions.services";
import { Contribution } from "../../../src/types/contributions";
import { useEffect, useState } from "react";

export function useContributionsOverdue() {
  const VISIBLE_AVATARS = 5;
  const membersStatus = useMembersStatus();
  const { viewingManagement, viewingOptions } = useViewingManagement();
  const [members, setMembers] = useState<Contribution[]>([]);

  useEffect(() => {
    if (!viewingManagement) {
      const waitingForViewing =
        membersStatus === "idle" ||
        membersStatus === "loading" ||
        viewingOptions.length > 0;

      if (!waitingForViewing) setMembers([]);
      return;
    }

    const controller = new AbortController();

    listContributionsOverdue(controller.signal, viewingManagement)
      .then(setMembers)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setMembers([]);
      });

    return () => controller.abort();
  }, [membersStatus, viewingManagement, viewingOptions.length]);

  const visibleMembers = members.slice(0, VISIBLE_AVATARS);
  const overflow = members.length - visibleMembers.length;

  if (members.length === 0) {
    return null;
  }

  return {
    members,
    visibleMembers,
    overflow
  };
}
