"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { CheckIcon } from "@phosphor-icons/react";
import { Button, DatePicker, Modal } from "@rotaract/components";
import { MemberAvatar } from "@rotaract/members";
import {
  dateTimeInputToIso,
  toDateInputValue,
  toTimeInputValue,
} from "../lib/dates";
import { MEMBER_INPUT_CLASS, normalizeSearch, type Member } from "../types/calendar";
import {
  EVENT_KINDS,
  EVENT_TEXTAREA_CLASS,
  eventKindLabel,
  type CalendarEvent,
  type CalendarEventPayload,
  type EventKind,
} from "../types/event";

type EventFormModalProps = {
  open: boolean;
  selectedDate: Date;
  event: CalendarEvent | null;
  members: Member[];
  currentUserId?: string;
  onClose: () => void;
  onSave: (payload: CalendarEventPayload) => void | Promise<void>;
};

export function EventFormModal({
  open,
  selectedDate,
  event,
  members,
  currentUserId,
  onClose,
  onSave,
}: EventFormModalProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(event);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [kind, setKind] = useState<EventKind>("reuniao");
  const [startDate, setStartDate] = useState(toDateInputValue(selectedDate));
  const [endDate, setEndDate] = useState(toDateInputValue(selectedDate));
  const [startTime, setStartTime] = useState("19:30");
  const [endTime, setEndTime] = useState("21:00");
  const [allDay, setAllDay] = useState(false);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [memberQuery, setMemberQuery] = useState("");
  const [personalEvent, setPersonalEvent] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    const start = event ? new Date(event.startsAt) : selectedDate;
    const end = event ? new Date(event.endsAt) : selectedDate;

    setTitle(event?.title ?? "");
    setNotes(event?.notes ?? "");
    setKind(event?.kind ?? "reuniao");
    setStartDate(toDateInputValue(start));
    setEndDate(toDateInputValue(end));
    setStartTime(event && !event.allDay ? toTimeInputValue(start) : "19:30");
    setEndTime(event && !event.allDay ? toTimeInputValue(end) : "21:00");
    setAllDay(event?.allDay ?? false);
    setMemberIds(event?.memberIds ?? []);
    setMemberQuery("");
    setPersonalEvent(
      Boolean(
        currentUserId &&
        event?.memberIds.length === 1 &&
        event.memberIds[0] === currentUserId
      )
    );
    setError("");
    setSaving(false);
  }, [currentUserId, event, open, selectedDate]);

  const selectableMembers = useMemo(() => {
    const term = normalizeSearch(memberQuery);

    return members
      .filter((member) => {
        if (personalEvent) return member.id === currentUserId;
        return member.status === "ativo" || memberIds.includes(member.id);
      })
      .filter((member) => {
        if (!term) return true;
        return (
          normalizeSearch(member.name).includes(term) ||
          normalizeSearch(member.role).includes(term)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [currentUserId, memberIds, memberQuery, members, personalEvent]);

  const selectedMembers = useMemo(
    () => members.filter((member) => memberIds.includes(member.id)),
    [memberIds, members]
  );

  const selectableIds = useMemo(
    () => selectableMembers.map((member) => member.id),
    [selectableMembers]
  );
  const allSelected =
    selectableIds.length > 0 &&
    selectableIds.every((id) => memberIds.includes(id));

  function toggleMember(id: string) {
    if (personalEvent) return;
    setMemberIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function toggleAllMembers() {
    if (personalEvent) return;
    setMemberIds((current) => {
      if (allSelected) {
        return current.filter((id) => !selectableIds.includes(id));
      }
      return Array.from(new Set([...current, ...selectableIds]));
    });
  }

  function togglePersonalEvent() {
    if (!currentUserId) return;

    if (personalEvent) {
      setPersonalEvent(false);
      return;
    }

    setPersonalEvent(true);
    setMemberIds([currentUserId]);
    setMemberQuery("");
  }

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (saving) return;

    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 3) {
      setError("Informe um título com pelo menos 3 caracteres.");
      return;
    }

    if (endDate < startDate) {
      setError("A data final não pode ser anterior à inicial.");
      return;
    }

    if (!allDay && endDate === startDate && endTime < startTime) {
      setError("O horário final não pode ser anterior ao inicial.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave({
        title: trimmedTitle,
        notes: notes.trim(),
        startsAt: dateTimeInputToIso(startDate, allDay ? "00:00" : startTime),
        endsAt: dateTimeInputToIso(endDate, allDay ? "23:59" : endTime),
        allDay,
        kind,
        memberIds: personalEvent && currentUserId ? [currentUserId] : memberIds,
      });
      onClose();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível salvar o evento."
      );
    } finally {
      setSaving(false);
    }
  }

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
              {currentUserId ? (
                <button
                  type="button"
                  onClick={togglePersonalEvent}
                  className={`text-sm font-medium transition ${personalEvent
                    ? "text-rotaract-magenta"
                    : "text-rotaract-pink hover:text-rotaract-magenta"
                    }`}
                >
                  {personalEvent ? "Remover evento pessoal" : "Evento pessoal"}
                </button>
              ) : null}
              {members.length > 0 && !personalEvent ? (
                <button
                  type="button"
                  onClick={toggleAllMembers}
                  disabled={selectableIds.length === 0}
                  className="text-sm font-medium text-rotaract-pink transition hover:text-rotaract-magenta disabled:text-zinc-400"
                >
                  {allSelected ? "Limpar seleção" : "Selecionar todos"}
                </button>
              ) : null}
            </div>
          </div>

          {selectedMembers.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedMembers.map((member) => (
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
                placeholder="Buscar por nome ou cargo"
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
            title={
              saving
                ? "Salvando..."
                : isEdit
                  ? "Salvar alterações"
                  : `Cadastrar ${eventKindLabel(kind).toLowerCase()}`
            }
          />
        </div>
      </form>
    </Modal>
  );
}
