"use client";

import { useMemo } from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { DEFAULT_PAGE_SIZE, type PaginationProps } from "../types/pagination";

function buildPageItems(
  current: number,
  total: number
): Array<number | "ellipsis"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const items: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push("ellipsis");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < total - 1) items.push("ellipsis");
  items.push(total);

  return items;
}

export function Pagination({
  page,
  totalItems,
  pageSize = DEFAULT_PAGE_SIZE,
  onPageChange,
  itemLabel = { singular: "item", plural: "itens" },
  compact = false,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pages = useMemo(
    () => buildPageItems(page, totalPages),
    [page, totalPages]
  );

  if (totalItems <= pageSize) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);
  const label = totalItems === 1 ? itemLabel.singular : itemLabel.plural;

  return (
    <nav
      className={`mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className ?? ""}`}
      aria-label="Paginação"
    >
      {compact ? null : (
        <p className="text-xs font-medium text-zinc-500">
          Mostrando{" "}
          <span className="tabular-nums text-zinc-700">
            {from}–{to}
          </span>{" "}
          de <span className="tabular-nums text-zinc-700">{totalItems}</span>{" "}
          {label}
        </p>
      )}

      <div className={`flex flex-wrap items-center gap-1 ${compact ? "w-full justify-center" : "sm:ml-auto"}`}>
        <button
          type="button"
          aria-label="Página anterior"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-zinc-200 text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CaretLeftIcon className="h-4 w-4" weight="bold" />
        </button>

        {pages.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-8 w-8 items-center justify-center text-xs text-zinc-400"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-label={`Página ${item}`}
              aria-current={item === page ? "page" : undefined}
              onClick={() => onPageChange(item)}
              className={`inline-flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-full px-2 text-xs font-semibold tabular-nums transition ${
                item === page
                  ? "bg-rotaract-pink text-white"
                  : "border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          aria-label="Próxima página"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-zinc-200 text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CaretRightIcon className="h-4 w-4" weight="bold" />
        </button>
      </div>
    </nav>
  );
}
