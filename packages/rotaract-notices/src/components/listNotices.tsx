import React from "react";
import { Notices } from "../types/notices";

export type ListNoticesProps = {
  notices: Notices[];
}

export function ListNotices({ notices }: ListNoticesProps) {
  function formatNoticeDate(value: string) {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <span>
      {notices.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">
          Nenhuma notificação por enquanto.
        </p>
      ) : (
        <ul className="mt-3 max-h-72 space-y-3 overflow-y-auto">
          {notices.map((notice) => (
            <li
              key={notice.id}
              className="border-b border-zinc-100 pb-3 last:border-0 last:pb-0"
            >
              <div className="flex items-start gap-2">
                <span
                  aria-hidden
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${notice.read ? "bg-transparent" : "bg-rotaract-pink"
                    }`}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-900">
                    {notice.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-zinc-500">
                    {notice.message}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {formatNoticeDate(notice.date)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </span>
  )
}