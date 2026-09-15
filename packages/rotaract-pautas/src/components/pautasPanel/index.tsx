"use client";

import { ClipboardTextIcon, PlusIcon } from "@phosphor-icons/react";
import { Button, Pagination, Tooltip } from "@rotaract/components";
import { MemberAvatar } from "@rotaract/members";
import { formatDate } from "../../lib/dates";
import {
  PAUTA_FILTERS,
  PAUTA_INPUT_CLASS,
  PAUTA_STATUS_LABELS,
  PAUTA_STATUS_STYLES,
  PAUTA_TYPE_LABELS,
  type PautaFilter,
} from "../../types/pautas";
import { PautaFormModal } from "../pautaFormModal";
import { PautaProgressBar } from "../pautaProgressBar";
import type { PautasPanelProps } from "./type";
import { usePautasPanel } from "./services";

export function PautasPanel({
  pautas,
  members,
  currentUserId,
  onOpen,
  onCreate,
}: PautasPanelProps) {
  const data = usePautasPanel({
    pautas,
    members,
    currentUserId,
    onOpen,
    onCreate,
  });
  if (!data) return null;
  const {
    query,
    setQuery,
    filter,
    setFilter,
    filtered,
    pagination,
    setFormOpen,
    formOpen,
  } = data;

  return (
    <section className="mt-8 rounded-3xl border border-zinc-200 bg-white p-4 shadow-[0_12px_40px_rgba(24,24,27,0.04)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Pautas do clube</h2>
          <p className="mt-1 hidden text-sm text-zinc-500 md:flex">
            Acompanhe reuniões, presenças, itens discutidos e o PDF de cada pauta.
          </p>
        </div>
        <Tooltip label="Nova pauta">
          <Button
            aria-label="Nova pauta"
            icon={<PlusIcon className="h-5 w-5" />}
            onClick={() => setFormOpen(true)}
          />
        </Tooltip>
      </div>

      <div className="mt-5 md:flex md:justify-center md:gap-2">
        <div className="min-w-0 flex-1">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={PAUTA_INPUT_CLASS}
            placeholder="Pesquisar..."
          />
        </div>
        <div className="mt-2 w-full md:mt-0 md:w-[30%]">
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as PautaFilter)}
            className={`${PAUTA_INPUT_CLASS} sm:max-w-xs`}
            aria-label="Status da pauta"
          >
            {PAUTA_FILTERS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-zinc-400">
        {filtered.length} {filtered.length === 1 ? "pauta" : "pautas"}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-2 flex flex-col items-center px-4 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rotaract-pink/10 text-rotaract-pink">
            <ClipboardTextIcon className="h-6 w-6" weight="bold" aria-hidden />
          </span>
          <p className="mt-4 text-sm font-medium text-zinc-800">
            {pautas.length === 0
              ? "Nenhuma pauta cadastrada ainda."
              : "Nenhuma pauta encontrada com esses filtros."}
          </p>
          <p className="mt-1 max-w-sm text-sm text-zinc-500">
            {pautas.length === 0
              ? "Comece cadastrando a primeira reunião do clube."
              : "Tente outro nome ou limpe o filtro para ver a lista completa."}
          </p>
          {pautas.length === 0 ? (
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="mt-5 text-sm font-semibold text-rotaract-pink transition hover:text-rotaract-magenta"
            >
              Cadastrar primeira pauta
            </button>
          ) : null}
        </div>
      ) : (
        <ul className="mt-2 grid gap-3">
          {pagination.pageItems.map(({ pauta, progress, present }, index) => (
            <li
              key={pauta.id}
              className="home-rise"
              style={{ animationDelay: `${80 + index * 50}ms` }}
            >
              <button
                type="button"
                onClick={() => onOpen(pauta.id)}
                className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-rotaract-pink/30 hover:bg-white hover:shadow-[0_20px_48px_rgba(255,45,122,0.10)] sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-zinc-900">
                        {pauta.title}
                      </p>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${PAUTA_STATUS_STYLES[pauta.status]}`}
                      >
                        {PAUTA_STATUS_LABELS[pauta.status]}
                      </span>
                      {pauta.generatedAt ? (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                          PDF gerado
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                      {PAUTA_TYPE_LABELS[pauta.type]}
                      {pauta.notes ? ` · ${pauta.notes}` : ""}
                    </p>
                  </div>
                  <span className="text-xs text-zinc-400">
                    {formatDate(pauta.meetingDate)}
                  </span>
                </div>

                <PautaProgressBar
                  completed={progress.resolved}
                  total={progress.total}
                  percent={progress.percent}
                />

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-zinc-500">
                    {pauta.items.length}{" "}
                    {pauta.items.length === 1 ? "item" : "itens"}
                    <span className="mx-1.5 text-zinc-300">•</span>
                    {present.length}{" "}
                    {present.length === 1 ? "presente" : "presentes"}
                  </p>
                  {present.length > 0 ? (
                    <div className="flex items-center">
                      <div className="flex -space-x-2">
                        {present.slice(0, 4).map((member) => (
                          <span key={member.id} className="rounded-full ring-2 ring-white">
                            <MemberAvatar member={member} size="xs" />
                          </span>
                        ))}
                      </div>
                      {present.length > 4 ? (
                        <span className="ml-2 text-xs text-zinc-500">
                          +{present.length - 4}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Pagination
        page={pagination.page}
        totalItems={pagination.totalItems}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setPage}
        itemLabel={{ singular: "pauta", plural: "pautas" }}
      />

      <PautaFormModal
        open={formOpen}
        pauta={null}
        members={members}
        currentUserId={currentUserId}
        onClose={() => setFormOpen(false)}
        onSave={onCreate}
      />
    </section>
  );
}
