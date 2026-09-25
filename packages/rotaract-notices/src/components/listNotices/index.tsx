"use client";

import React from "react";
import { CaretDownIcon } from "@phosphor-icons/react";
import { Pagination } from "@rotaract/components";
import { ListNoticesProps } from "./type";
import { useListNotices } from "./services";

export function ListNotices({ notices }: ListNoticesProps) {
  const data = useListNotices({ notices });
  if (!data) return null;
  const {
    formatNoticeDate,
    pagination,
    expandedId,
    toggleExpanded,
  } = data;

  return (
    <div>
      {notices.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-500">
          Nenhuma notificação por enquanto.
        </p>
      ) : (
        <>
          <ul className="space-y-3">
            {pagination.pageItems.map((notice) => {
              const expanded = expandedId === notice.id;

              return (
                <li
                  key={notice.id}
                  className="border-b border-zinc-100 pb-3 last:border-0 last:pb-0"
                >
                  <button
                    type="button"
                    onClick={() => toggleExpanded(notice.id)}
                    aria-expanded={expanded}
                    className="flex w-full items-start gap-2 rounded-xl text-left transition hover:bg-zinc-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rotaract-pink/25"
                  >
                    <span
                      aria-hidden
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        notice.read ? "bg-transparent" : "bg-rotaract-pink"
                      }`}
                    />
                    <div className="min-w-0 flex-1 py-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-zinc-900">
                          {notice.title}
                        </p>
                        <CaretDownIcon
                          size={14}
                          weight="bold"
                          aria-hidden
                          className={`mt-0.5 shrink-0 text-zinc-400 transition ${
                            expanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                      <p
                        className={`mt-0.5 whitespace-pre-line text-sm text-zinc-500 ${
                          expanded ? "" : "line-clamp-2"
                        }`}
                      >
                        {notice.message}
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        {formatNoticeDate(notice.date)}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
          <Pagination
            page={pagination.page}
            totalItems={pagination.totalItems}
            pageSize={pagination.pageSize}
            onPageChange={pagination.setPage}
            itemLabel={{ singular: "notificação", plural: "notificações" }}
            compact
          />
        </>
      )}
    </div>
  );
}
