"use client";

import { CheckIcon, TrashIcon } from "@phosphor-icons/react";
import { Button, DatePicker, Modal } from "@rotaract/components";
import { MemberAvatar } from "@rotaract/members";
import { MEMBER_INPUT_CLASS } from "../../types/calendar";
import {
  EVENT_KINDS,
  EVENT_TEXTAREA_CLASS,
  eventKindLabel,
} from "../../types/event";
import { EventFormModalProps } from "./types";
import { useEventFormModal } from "./services";

export function EventFormModal({
  open,
  selectedDate,
  event,
  members,
  currentUserId,
  onClose,
  onSave,
  onDelete,
}: EventFormModalProps) {

  const data = useEventFormModal({
    open,
    selectedDate,
    event,
    members,
    currentUserId,
    onClose,
    onSave,
  });

  if (!data) return null;

  const {
    titleRef,
    isEdit,
    title,
    notes,
    kind,
    startDate,
    endDate,
    startTime,
    endTime,
    allDay,
    memberIds,
    memberQuery,
    personalEvent,
    error,
    saving,
    handleSubmit,
    setTitle,
    setKind,
    setStartDate,
    setEndDate,
    setStartTime,
    setEndTime,
    setAllDay,
    setMemberQuery,
    setNotes,
    selectedMembers,
    toggleAllMembers,
    selectableIds,
    allSelected,
    toggleMember,
    selectableMembers,
    VISIBLE_SELECTED_MEMBERS
  } = data;

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Agenda"
      title={isEdit ? "Editar evento" : "Novo evento"}
      description={
        isEdit
          ? "Atualize o compromisso e quem do clube participa."
          : "Cadastre um compromisso na agenda e escolha os companheiros envolvidos."
      }
      initialFocusRef={titleRef}
      size="lg"
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[min(72vh,40rem)] overflow-y-auto px-5 py-5 sm:px-6"
      >
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-rotaract-mist p-1 sm:grid-cols-4">
          {EVENT_KINDS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setKind(item.id)}
              className={`h-11 rounded-[1.1rem] text-sm font-semibold transition ${kind === item.id
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-sm text-zinc-600">Título</span>
          <input
            ref={titleRef}
            value={title}
            onChange={(changeEvent) => setTitle(changeEvent.target.value)}
            className={MEMBER_INPUT_CLASS}
            placeholder="Ex.: Reunião ordinária"
            maxLength={80}
          />
        </label>

        <label className="mt-4 flex items-center gap-3 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={allDay}
            onChange={(changeEvent) => setAllDay(changeEvent.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-zinc-300 text-rotaract-pink focus:ring-rotaract-pink/30"
          />
          <p className="cursor-pointer">Dia inteiro</p>
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="event-start-date" className="mb-1.5 block text-sm text-zinc-600">
              {allDay ? "Data inicial" : "Início"}
            </label>
            <DatePicker
              id="event-start-date"
              value={startDate}
              onChange={setStartDate}
              fixedPopover
              allowClear={false}
              showTime={!allDay}
              time={startTime}
              onTimeChange={setStartTime}
            />
          </div>
          <div>
            <label htmlFor="event-end-date" className="mb-1.5 block text-sm text-zinc-600">
              {allDay ? "Data final" : "Fim"}
            </label>
            <DatePicker
              id="event-end-date"
              value={endDate}
              onChange={setEndDate}
              baseDate={startDate}
              fixedPopover
              allowClear={false}
              showTime={!allDay}
              time={endTime}
              onTimeChange={setEndTime}
            />
          </div>
        </div>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm text-zinc-600">Observações</span>
          <textarea
            value={notes}
            onChange={(changeEvent) => setNotes(changeEvent.target.value)}
            className={EVENT_TEXTAREA_CLASS}
            placeholder="Pauta, local ou recados para o clube"
            maxLength={400}
          />
        </label>

        <div className="mt-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm text-zinc-600">Companheiros no evento</p>
              <p className="mt-0.5 text-xs text-zinc-400">
                {personalEvent
                  ? "Somente você participa deste evento."
                  : selectedMembers.length === 0
                    ? "Nenhum selecionado ainda"
                    : `${selectedMembers.length} ${selectedMembers.length === 1 ? "participante" : "participantes"}`}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
              <button
                type="button"
                onClick={toggleAllMembers}
                disabled={selectableIds.length === 0}
                className="text-sm font-medium text-rotaract-pink transition hover:text-rotaract-magenta disabled:text-zinc-400"
              >
                {allSelected ? "Limpar" : "Selecionar todos"}
              </button>
            </div>
          </div>

          {selectedMembers.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedMembers.slice(0, VISIBLE_SELECTED_MEMBERS).map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => toggleMember(member.id)}
                  disabled={personalEvent}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white py-1 pl-1 pr-3 text-xs font-medium text-zinc-700 transition hover:border-rose-200 hover:text-rose-600 disabled:cursor-default disabled:hover:border-zinc-200 disabled:hover:text-zinc-700"
                >
                  <MemberAvatar member={member} size="xs" />
                  {member.name.split(" ")[0]}
                </button>
              ))}
              {selectedMembers.length > VISIBLE_SELECTED_MEMBERS ? (
                <span
                  className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-500"
                  aria-label={`Mais ${selectedMembers.length - VISIBLE_SELECTED_MEMBERS} participantes`}
                >
                  +{selectedMembers.length - VISIBLE_SELECTED_MEMBERS}
                </span>
              ) : null}
            </div>
          ) : null}

          {members.length === 0 ? (
            <p className="mt-3 rounded-2xl border border-dashed border-zinc-200 px-4 py-5 text-sm text-zinc-500">
              Cadastre companheiros no módulo de membros para vinculá-los aos eventos.
            </p>
          ) : personalEvent ? (
            <ul className="mt-3 divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200">
              {selectableMembers.map((member) => (
                <li key={member.id}>
                  <div className="flex w-full items-center gap-3 bg-rotaract-pink/5 px-3 py-2.5 text-left">
                    <MemberAvatar member={member} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-zinc-900">
                        {member.name}
                      </span>
                      <span className="block truncate text-xs text-zinc-500">
                        {member.role}
                      </span>
                    </span>
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-rotaract-pink bg-rotaract-pink text-white">
                      <CheckIcon className="h-3 w-3" weight="bold" />
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <input
                value={memberQuery}
                onChange={(changeEvent) => setMemberQuery(changeEvent.target.value)}
                className={`${MEMBER_INPUT_CLASS} mt-3`}
                placeholder="Pesquisar..."
              />
              <ul className="mt-3 max-h-48 divide-y divide-zinc-100 overflow-y-auto rounded-2xl border border-zinc-200">
                {selectableMembers.length === 0 ? (
                  <li className="px-4 py-6 text-center text-sm text-zinc-500">
                    Nenhum membro encontrado.
                  </li>
                ) : (
                  selectableMembers.map((member) => {
                    const selected = memberIds.includes(member.id);
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
            </>
          )}
        </div>

        {error ? (
          <p className="mt-4 text-sm text-rose-500" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {isEdit && onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={saving}
              className="inline-flex h-12 cursor-pointer items-center justify-center gap-1.5 rounded-full px-5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <TrashIcon className="h-4 w-4" />
              Excluir agendamento
            </button>
          ) : (
            <span className="hidden sm:block" />
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-12 cursor-pointer rounded-full px-5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              loading={saving}
              title={
                saving
                  ? "Salvando..."
                  : isEdit
                    ? "Salvar alterações"
                    : `Cadastrar ${eventKindLabel(kind).toLowerCase()}`
              }
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
