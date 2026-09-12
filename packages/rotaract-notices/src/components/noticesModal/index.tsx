"use client";

import { CheckIcon } from "@phosphor-icons/react";
import { Button, Modal } from "@rotaract/components";
import {
  MemberAvatar,
} from "@rotaract/members";
import {
  NOTICE_INPUT_CLASS,
  NOTICE_TEXTAREA_CLASS,
} from "../../types/notices";
import { NoticesModalProps } from "./type";
import { useNoticesModal } from "./services";

export function NoticesModal({ open, onClose, onCreated }: NoticesModalProps) {

  const data = useNoticesModal({ onCreated, onClose, open });
  if (!data) return null;
  const {
    titleRef,
    title,
    setTitle,
    message,
    setMessage,
    selectedMembers,
    query,
    setQuery,
    handleSubmit,
    loadingMembers,
    visibleIds,
    allSelected,
    toggleAll,
    toggleMember,
    filteredMembers,
    selectedIds,
    saving,
    displayedError,
    submitLabel
  } = data;

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Notificações"
      title="Nova notificação"
      description="Escreva o recado e escolha os membros que devem receber."
      initialFocusRef={titleRef}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="px-5 py-5 sm:px-6">
        <label className="block">
          <span className="mb-1.5 block text-sm text-zinc-600">Título</span>
          <input
            ref={titleRef}
            value={title}
            onChange={(changeEvent) => setTitle(changeEvent.target.value)}
            className={NOTICE_INPUT_CLASS}
            placeholder="Ex.: Assembleia de setembro"
            maxLength={80}
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm text-zinc-600">Mensagem</span>
          <textarea
            value={message}
            onChange={(changeEvent) => setMessage(changeEvent.target.value)}
            className={NOTICE_TEXTAREA_CLASS}
            placeholder="Escreva o recado para os membros selecionados"
            maxLength={400}
          />
        </label>

        <div className="mt-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm text-zinc-600">Membros</p>
              <p className="mt-0.5 text-xs text-zinc-400">
                {selectedMembers.length === 0
                  ? "Nenhum selecionado ainda"
                  : `${selectedMembers.length} ${selectedMembers.length === 1 ? "membro" : "membros"}`}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleAll}
              disabled={loadingMembers || visibleIds.length === 0}
              className="text-sm font-medium text-rotaract-pink transition hover:text-rotaract-magenta disabled:text-zinc-400"
            >
              {allSelected ? "Limpar seleção" : "Selecionar todos"}
            </button>
          </div>

          {selectedMembers.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedMembers.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => toggleMember(member.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white py-1 pl-1 pr-3 text-xs font-medium text-zinc-700 transition hover:border-rose-200 hover:text-rose-600"
                >
                  <MemberAvatar member={member} size="xs" />
                  {member.name.split(" ")[0]}
                </button>
              ))}
            </div>
          ) : null}

          <input
            type="search"
            value={query}
            onChange={(changeEvent) => setQuery(changeEvent.target.value)}
            onKeyDown={(changeEvent) => {
              if (changeEvent.key === "Enter") changeEvent.preventDefault();
            }}
            disabled={loadingMembers}
            className={`${NOTICE_INPUT_CLASS} mt-3`}
            placeholder="Pesquisar..."
            autoComplete="off"
          />
          <ul
            className="mt-3 max-h-56 divide-y divide-zinc-100 overflow-y-auto rounded-2xl border border-zinc-200"
            aria-busy={loadingMembers || undefined}
          >
            {loadingMembers ? (
              <li
                className="flex flex-col items-center justify-center gap-3 px-4 py-10"
                role="status"
                aria-live="polite"
              >
                <span
                  className="h-8 w-8 animate-spin rounded-full border-[3px] border-zinc-200 border-t-rotaract-pink motion-reduce:animate-none"
                  aria-hidden
                />
                <span className="text-sm font-medium text-zinc-600">
                  Carregando membros...
                </span>
              </li>
            ) : filteredMembers.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-zinc-500">
                Nenhum membro encontrado.
              </li>
            ) : (
              filteredMembers.map((member) => {
                const selected = selectedIds.includes(member.id);
                return (
                  <li key={member.id}>
                    <button
                      type="button"
                      onClick={() => toggleMember(member.id)}
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${selected ? "bg-rotaract-pink/5" : "hover:bg-zinc-50"
                        }`}
                    >
                      <MemberAvatar member={member} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-zinc-900">
                          {member.name}
                        </span>
                        <span className="block truncate text-xs text-zinc-500">
                          {member.role}
                        </span>
                      </span>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected
                          ? "border-rotaract-pink bg-rotaract-pink text-white"
                          : "border-zinc-300 bg-white"
                          }`}
                      >
                        {selected ? (
                          <CheckIcon className="h-3 w-3" weight="bold" />
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        {displayedError ? (
          <p className="mt-4 text-sm text-rose-500" role="alert">
            {displayedError}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-12 rounded-full px-5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cancelar
          </button>
          <Button
            type="submit"
            loading={saving}
            disabled={saving || loadingMembers}
            title={saving ? "Enviando..." : submitLabel}
          />
        </div>
      </form>
    </Modal>
  );
}
