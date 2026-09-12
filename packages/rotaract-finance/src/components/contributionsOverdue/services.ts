"use client";

import { listContributionsOverdue } from "../../../src/services/database.contributions.services";
import { Contribution } from "../../../src/types/contributions";
import { useEffect, useState } from "react";

export function useContributionsOverdue() {
  const VISIBLE_AVATARS = 5;
  const [members, setMembers] = useState<Contribution[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    listContributionsOverdue(controller.signal)
      .then(setMembers)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setMembers([]);
      });

    return () => controller.abort();
  }, []);

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
