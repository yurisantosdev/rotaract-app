"use client";

import { Tooltip } from "@rotaract/components";
import { MemberAvatar } from "@rotaract/members";
import { useContributionsOverdue } from "./services";

export function ContributionsOverdue() {
  const data = useContributionsOverdue();
  if (!data) return null;
  const {
    members,
    visibleMembers,
    overflow
  } = data;

  return (
    <div className="rounded-3xl border border-zinc-200/80 bg-white p-2 shadow-[0_12px_40px_rgba(24,24,27,0.04)] relative">
      <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rotaract-pink px-1 text-[10px] font-bold leading-none text-white">
        {members.length}
      </span>

      <div className="flex items-center gap-2">
        {visibleMembers.map((member, index) => (
          <Tooltip label={member.name} key={member.id || `${member.name}-${index}`}>
            <MemberAvatar member={{ name: member.name }} size="xs" />
          </Tooltip>
        ))}
        {overflow > 0 ? (
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rotaract-pink/10 text-[10px] font-semibold text-rotaract-pink"
            aria-label={`Mais ${overflow} membros`}
          >
            +{overflow}
          </span>
        ) : null}
      </div>
    </div>
  );
}
