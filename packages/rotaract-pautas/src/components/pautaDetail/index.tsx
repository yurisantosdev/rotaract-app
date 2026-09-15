"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarBlankIcon,
  CheckCircleIcon,
  CheckIcon,
  ClipboardTextIcon,
  CopyIcon,
  DownloadSimpleIcon,
  FilePdfIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import {
  Button,
  CelebrationConfetti,
  ConfirmModal,
  Pagination,
  Tooltip,
} from "@rotaract/components";
import { MemberAvatar } from "@rotaract/members";
import { formatDate } from "../../lib/dates";
import { findMember, firstName } from "../../lib/members";
import {
  PAUTA_STATUS_LABELS,
  PAUTA_STATUS_STYLES,
  PAUTA_TYPE_LABELS,
  type PautaDetailProps,
} from "../../types/pautas";
import {
  PAUTA_ITEM_FILTERS,
  PAUTA_ITEM_STATUS_OPTIONS,
  PAUTA_ITEM_STATUS_STYLES,
} from "../../types/pautaItems";
import { EditDeletePauta } from "../editDeletePauta";
import { PautaFormModal } from "../pautaFormModal";
import { PautaItemFormModal } from "../pautaItemFormModal";
import { PautaProgressBar } from "../pautaProgressBar";
import { ItemStatCard } from "./_components/ItemStatCard";
import { usePautaDetail } from "./services";

export function PautaDetail({
  pauta,
  members,
  onUpdatePauta,
  onRemovePauta,
  onDuplicatePauta,
  onCreateItem,
  onUpdateItem,
  onChangeItemStatus,
  onRemoveItem,
  onMoveItem,
  onImportPendingItems,
  canImportPendingItems,
  onGeneratePdf,
  onDownloadPdf,
  generatingPdf,
  downloadingPdf,
}: PautaDetailProps) {
  const data = usePautaDetail({
    pauta,
    members,
    onUpdatePauta,
    onRemovePauta,
    onDuplicatePauta,
    onCreateItem,
    onUpdateItem,
    onChangeItemStatus,
    onRemoveItem,
    onMoveItem,
    onImportPendingItems,
    canImportPendingItems,
    onGeneratePdf,
    onDownloadPdf,
    generatingPdf,
    downloadingPdf,
  });
  if (!data) return null;
  const {
    celebrationBurst,
    celebrate,
    setCelebrate,
    pautaFormOpen,
    setPautaFormOpen,
    itemFormOpen,
    itemToDelete,
    setItemToDelete,
    confirmRemovePauta,
    setConfirmRemovePauta,
    itemFilter,
    setItemFilter,
    present,
    progress,
    pendingItems,
    resolvedItems,
    postponedItems,
    assignableMembers,
    filteredItems,
    pagination,
    editingItem,
    openCreateItem,
    openEditItem,
    closeItemForm,
    handleSaveItem,
    markingAsRealized,
    canMarkAsRealized,
    handleMarkAsRealized,
  } = data;

  const canDownload = Boolean(pauta.generatedAt);

  return (
    <div className="mt-8 space-y-4">
      <CelebrationConfetti
        key={celebrationBurst}
        active={celebrate}
        onComplete={() => setCelebrate(false)}
      />

      <section className="home-rise rounded-3xl border border-zinc-200 bg-white p-4 shadow-[0_12px_40px_rgba(24,24,27,0.04)] sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${PAUTA_STATUS_STYLES[pauta.status]}`}
                >
                  {PAUTA_STATUS_LABELS[pauta.status]}
                </span>
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-600">
                  {PAUTA_TYPE_LABELS[pauta.type]}
                </span>
                {pauta.generatedAt ? (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                    PDF gerado
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                    PDF pendente
                  </span>
                )}
              </div>

              <div className="shrink-0 md:hidden">
                <EditDeletePauta
                  onEdit={() => setPautaFormOpen(true)}
                  onDelete={() => setConfirmRemovePauta(true)}
                />
              </div>
            </div>

            <p className="mt-3 flex items-start gap-1.5 text-sm text-zinc-500">
              <CalendarBlankIcon
                className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400"
                aria-hidden
              />
              <span className="min-w-0 line-clamp-3">
                Reunião em {formatDate(pauta.meetingDate)}
                {pauta.notes ? ` · ${pauta.notes}` : ""}
              </span>
            </p>
          </div>

          <div
            className={`shrink-0 items-center gap-2 ${
              canMarkAsRealized
                ? "flex w-full md:w-auto"
                : "hidden md:flex"
            }`}
          >
            {canMarkAsRealized ? (
              <div className="min-w-0 flex-1 [&>span]:flex [&>span]:w-full md:flex-none md:[&>span]:w-auto">
                <Tooltip label="Marcar reunião como realizada">
                  <button
                    type="button"
                    aria-label="Marcar reunião como realizada"
                    disabled={markingAsRealized}
                    onClick={handleMarkAsRealized}
                    className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-emerald-500 px-4 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-wait disabled:opacity-80 md:w-auto"
                  >
                    {markingAsRealized ? (
                      <span
                        className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/35 border-t-white motion-reduce:animate-none"
                        aria-hidden
                      />
                    ) : (
                      <CheckCircleIcon className="h-5 w-5" weight="fill" />
                    )}
                    Marcar como realizada
                  </button>
                </Tooltip>
              </div>
            ) : null}

            <div className="hidden md:flex">
              <EditDeletePauta
                onEdit={() => setPautaFormOpen(true)}
                onDelete={() => setConfirmRemovePauta(true)}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <article className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Presentes
            </p>
            {present.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">
                Nenhum companheiro marcado nesta reunião.
              </p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {present.map((member) => (
                  <span
                    key={member.id}
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white py-1 pl-1 pr-3 text-xs font-medium text-zinc-700"
                  >
                    <MemberAvatar member={member} size="xs" />
                    {firstName(member.name)}
                  </span>
                ))}
              </div>
            )}
          </article>

          <article className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Documento
            </p>
            <p className="mt-3 text-sm text-zinc-500">
              {canDownload
                ? "A pauta já foi gerada. Qualquer alteração exige gerar o PDF de novo."
                : "Gere o PDF com os dados atuais para liberar o download."}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Tooltip label="Gerar pauta em PDF">
                <Button
                  aria-label="Gerar pauta"
                  icon={<FilePdfIcon className="h-5 w-5" />}
                  loading={generatingPdf}
                  onClick={() => onGeneratePdf()}
                />
              </Tooltip>
              <Tooltip
                label={
                  canDownload
                    ? "Baixar pauta"
                    : "Gere a pauta antes de baixar"
                }
              >
                <span className="inline-flex">
                  <button
                    type="button"
                    aria-label="Baixar pauta"
                    disabled={!canDownload || downloadingPdf}
                    onClick={() => onDownloadPdf()}
                    className="inline-flex items-center justify-center rounded-full bg-emerald-500 p-3.5 text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
                  >
                    <DownloadSimpleIcon className="h-5 w-5" />
                  </button>
                </span>
              </Tooltip>
              <Tooltip label="Duplicar pauta">
                <button
                  type="button"
                  aria-label="Duplicar pauta"
                  onClick={() => onDuplicatePauta()}
                  className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white p-3.5 text-zinc-600 transition hover:border-rotaract-pink/30 hover:text-rotaract-pink"
                >
                  <CopyIcon className="h-5 w-5" />
                </button>
              </Tooltip>
            </div>
          </article>
        </div>

        <PautaProgressBar
          completed={progress.resolved}
          total={progress.total}
          percent={progress.percent}
          className="mt-5"
        />
      </section>

      <section
        className="home-rise mt-2 rounded-3xl border border-zinc-200 bg-white p-4 shadow-[0_12px_40px_rgba(24,24,27,0.04)] sm:p-6"
        style={{ animationDelay: "80ms" }}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Itens da pauta</h2>
            <p className="mt-1 hidden text-sm text-zinc-500 md:flex">
              Assuntos discutidos na reunião, cada um com um responsável.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canImportPendingItems ? (
              <Tooltip label="Trazer pendências da última reunião">
                <button
                  type="button"
                  aria-label="Trazer pendências"
                  onClick={() => onImportPendingItems()}
                  className="hidden h-11 rounded-full px-4 text-sm font-semibold text-rotaract-pink transition hover:bg-rotaract-pink/10 sm:inline-flex sm:items-center"
                >
                  Trazer pendências
                </button>
              </Tooltip>
            ) : null}
            <Tooltip label="Novo item">
              <Button
                aria-label="Novo item"
                icon={<PlusIcon className="h-5 w-5" />}
                onClick={openCreateItem}
              />
            </Tooltip>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <ItemStatCard
            title="Itens"
            value={pauta.items.length}
            description="Nesta pauta"
          />
          <ItemStatCard
            title="Pendentes"
            value={pendingItems}
            description="Ainda não discutidos"
          />
          <ItemStatCard
            title="Adiados"
            value={postponedItems}
            description="Ficaram para depois"
          />
          <ItemStatCard
            title="Resolvidos"
            value={resolvedItems}
            description="Já encaminhados"
          />
        </div>

        <div className="mt-5 flex overflow-x-auto rounded-full border border-zinc-200 bg-zinc-50 p-1">
          {PAUTA_ITEM_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setItemFilter(item.id)}
              className={`h-9 flex-1 shrink-0 rounded-full px-0 text-xs font-medium transition md:px-3 md:text-sm ${itemFilter === item.id
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div className="mt-4 flex flex-col items-center px-4 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rotaract-pink/10 text-rotaract-pink">
              <ClipboardTextIcon className="h-6 w-6" weight="bold" aria-hidden />
            </span>
            <p className="mt-4 text-sm font-medium text-zinc-800">
              {pauta.items.length === 0
                ? "Nenhum item nesta pauta."
                : "Nenhum item neste filtro."}
            </p>
            <p className="mt-1 max-w-sm text-sm text-zinc-500">
              {pauta.items.length === 0
                ? "Cadastre os assuntos que serão discutidos e o responsável de cada um."
                : "Troque o filtro para ver o restante da lista."}
            </p>
            {pauta.items.length === 0 ? (
              <div className="mt-5 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={openCreateItem}
                  className="text-sm font-semibold text-rotaract-pink transition hover:text-rotaract-magenta"
                >
                  Cadastrar primeiro item
                </button>
                {canImportPendingItems ? (
                  <button
                    type="button"
                    onClick={() => onImportPendingItems()}
                    className="text-sm font-medium text-zinc-500 transition hover:text-zinc-800"
                  >
                    Trazer pendências da última reunião
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {pagination.pageItems.map((item, index) => {
              const responsible = findMember(members, item.responsibleId);
              const globalIndex = pauta.items
                .slice()
                .sort((a, b) => a.order - b.order)
                .findIndex((entry) => entry.id === item.id);
              const isFirst = globalIndex === 0;
              const isLast = globalIndex === pauta.items.length - 1;

              return (
                <li
                  key={item.id}
                  className="home-rise rounded-2xl border border-zinc-100 bg-zinc-50 p-4 transition hover:-translate-y-0.5 hover:border-rotaract-pink/30 hover:bg-white hover:shadow-[0_20px_48px_rgba(255,45,122,0.10)]"
                  style={{ animationDelay: `${120 + index * 50}ms` }}
                >
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-400">
                          {item.order}.
                        </span>
                        <p className="font-medium text-zinc-900">{item.title}</p>
                      </div>
                      {item.description ? (
                        <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                          {item.description}
                        </p>
                      ) : null}
                      <div className="mt-2 flex min-w-0 items-center gap-2">
                        {responsible ? (
                          <MemberAvatar member={responsible} size="xs" />
                        ) : null}
                        <p className="truncate text-xs text-zinc-500">
                          {responsible
                            ? `Responsável: ${firstName(responsible.name)}`
                            : "Responsável não encontrado"}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Tooltip label="Subir">
                        <button
                          type="button"
                          aria-label={`Subir ${item.title}`}
                          disabled={isFirst}
                          onClick={() => onMoveItem(item.id, "up")}
                          className="rounded-full p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-800 disabled:opacity-30"
                        >
                          <ArrowUpIcon className="h-4 w-4" />
                        </button>
                      </Tooltip>
                      <Tooltip label="Descer">
                        <button
                          type="button"
                          aria-label={`Descer ${item.title}`}
                          disabled={isLast}
                          onClick={() => onMoveItem(item.id, "down")}
                          className="rounded-full p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-800 disabled:opacity-30"
                        >
                          <ArrowDownIcon className="h-4 w-4" />
                        </button>
                      </Tooltip>
                      <Tooltip label="Editar">
                        <button
                          type="button"
                          aria-label={`Editar ${item.title}`}
                          onClick={() => openEditItem(item)}
                          className="rounded-full p-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
                        >
                          <PencilSimpleIcon className="h-4 w-4" />
                        </button>
                      </Tooltip>
                      <Tooltip label="Excluir">
                        <button
                          type="button"
                          aria-label={`Excluir ${item.title}`}
                          onClick={() => setItemToDelete(item)}
                          className="rounded-full p-1.5 text-zinc-400 transition hover:bg-rose-50 hover:text-rose-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {PAUTA_ITEM_STATUS_OPTIONS.map((option) => {
                      const selected = item.status === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => onChangeItemStatus(item.id, option.id)}
                          aria-pressed={selected}
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ring-inset transition ${selected
                            ? PAUTA_ITEM_STATUS_STYLES[option.id].selected
                            : PAUTA_ITEM_STATUS_STYLES[option.id].chip
                            }`}
                        >
                          {selected ? (
                            <CheckIcon className="h-3 w-3" weight="bold" aria-hidden />
                          ) : null}
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <Pagination
          page={pagination.page}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={pagination.setPage}
          itemLabel={{ singular: "item", plural: "itens" }}
        />
      </section>

      <PautaFormModal
        open={pautaFormOpen}
        pauta={pauta}
        members={members}
        onClose={() => setPautaFormOpen(false)}
        onSave={onUpdatePauta}
      />

      <PautaItemFormModal
        open={itemFormOpen}
        item={editingItem}
        members={assignableMembers.length > 0 ? assignableMembers : members}
        defaultResponsibleId={pauta.presentMemberIds[0]}
        onClose={closeItemForm}
        onSave={handleSaveItem}
      />

      <ConfirmModal
        open={confirmRemovePauta}
        title="Excluir pauta?"
        description={`“${pauta.title}” será removida do clube, junto com os itens desta reunião.`}
        confirmLabel="Excluir"
        onClose={() => setConfirmRemovePauta(false)}
        onConfirm={() => {
          setConfirmRemovePauta(false);
          onRemovePauta();
        }}
      />

      <ConfirmModal
        open={Boolean(itemToDelete)}
        title="Excluir item?"
        description={
          itemToDelete
            ? `“${itemToDelete.title}” será removido desta pauta.`
            : undefined
        }
        confirmLabel="Excluir"
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (!itemToDelete) return;
          onRemoveItem(itemToDelete.id);
          setItemToDelete(null);
        }}
      />
    </div>
  );
}
