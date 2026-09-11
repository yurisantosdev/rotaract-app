"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { EventKind } from "../../types/event";
import { normalizeSearch } from "../../types/calendar";
import { dateTimeInputToIso, toDateInputValue, toTimeInputValue } from "../../lib/dates";
import { AlertError, AlertSuccess } from "@rotaract/components";
import { EventFormModalProps } from "./types";

export function useEventFormModal({
  open,
  selectedDate,
  event,
  members,
  currentUserId,
  onClose,
  onSave,
}: EventFormModalProps) {
  const VISIBLE_SELECTED_MEMBERS = 3;
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
    setMemberIds(
      event?.memberIds ?? (currentUserId ? [currentUserId] : [])
    );
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
      AlertSuccess(isEdit ? `Agendamento atualizado com sucesso` : `Agendamento salvo com sucesso`);
      onClose();
    } catch (caught) {
      AlertError(`Não foi possível ${isEdit ? "atualizar" : "salvar"} o agendamento.`);
      setError(`Não foi possível ${isEdit ? "atualizar" : "salvar"} o agendamento.`);
    } finally {
      setSaving(false);
    }
  }


  return {
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
  };
}
