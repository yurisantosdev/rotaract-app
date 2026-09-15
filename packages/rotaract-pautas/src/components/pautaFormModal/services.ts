"use client";

import { AlertError, AlertSuccess } from "@rotaract/components";
import { FormEvent, useEffect, useRef, useState } from "react";
import { todayISO } from "../../lib/dates";
import {
  defaultPautaTitle,
  uniqueIds,
  type PautaStatus,
  type PautaType,
} from "../../types/pautas";
import {
  listFutureCalendarMeetings,
  type CalendarMeetingOption,
} from "../../services/database.calendar.services";
import type { PautaFormModalProps } from "./type";

export function usePautaFormModal({
  open,
  pauta,
  currentUserId,
  onClose,
  onSave,
}: PautaFormModalProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(pauta);
  const [title, setTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState(todayISO());
  const [type, setType] = useState<PautaType>("ordinaria");
  const [status, setStatus] = useState<PautaStatus>("rascunho");
  const [notes, setNotes] = useState("");
  const [presentMemberIds, setPresentMemberIds] = useState<string[]>([]);
  const [calendarEventId, setCalendarEventId] = useState<string | null>(null);
  const [calendarMeetings, setCalendarMeetings] = useState<CalendarMeetingOption[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [autoTitle, setAutoTitle] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    const nextDate = pauta?.meetingDate ?? todayISO();
    const nextType = pauta?.type ?? "ordinaria";
    const initialTitle = pauta?.title ?? defaultPautaTitle(nextType, nextDate);

    setTitle(initialTitle);
    setMeetingDate(nextDate);
    setType(nextType);
    setStatus(pauta?.status ?? "rascunho");
    setNotes(pauta?.notes ?? "");
    setPresentMemberIds(
      uniqueIds(
        pauta?.presentMemberIds ?? (currentUserId ? [currentUserId] : [])
      )
    );
    setCalendarEventId(pauta?.calendarEventId ?? null);
    setAutoTitle(!pauta);
    setError("");
    setSaving(false);
  }, [currentUserId, open, pauta]);

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    setLoadingMeetings(true);

    void listFutureCalendarMeetings(controller.signal)
      .then((meetings) => {
        if (controller.signal.aborted) return;
        setCalendarMeetings(meetings);

        const linked = pauta?.calendarEventId
          ? meetings.find((meeting) => meeting.id === pauta.calendarEventId)
          : null;

        if (linked) {
          setPresentMemberIds((current) =>
            uniqueIds([...current, ...linked.acceptedMemberIds])
          );
        }
      })
      .catch((caught: unknown) => {
        if (caught instanceof DOMException && caught.name === "AbortError") {
          return;
        }
        setCalendarMeetings([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingMeetings(false);
        }
      });

    return () => controller.abort();
  }, [open, pauta?.calendarEventId]);

  function handleTypeChange(nextType: PautaType) {
    setType(nextType);
    if (autoTitle) {
      setTitle(defaultPautaTitle(nextType, meetingDate));
    }
  }

  function handleDateChange(nextDate: string) {
    setMeetingDate(nextDate);
    if (autoTitle) {
      setTitle(defaultPautaTitle(type, nextDate));
    }
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    setAutoTitle(false);
  }

  function handleCalendarMeetingChange(meetingId: string) {
    if (!meetingId) {
      setCalendarEventId(null);
      return;
    }

    const meeting = calendarMeetings.find((item) => item.id === meetingId);
    if (!meeting) {
      setCalendarEventId(null);
      return;
    }

    setCalendarEventId(meeting.id);
    setMeetingDate(meeting.date);
    if (autoTitle) {
      setTitle(defaultPautaTitle(type, meeting.date));
    }
    setPresentMemberIds((current) =>
      uniqueIds([...current, ...meeting.acceptedMemberIds])
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 3) {
      setError("Informe um título com pelo menos 3 caracteres.");
      return;
    }

    if (!meetingDate) {
      setError("Informe a data da reunião.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave({
        title: trimmedTitle,
        meetingDate,
        type,
        status,
        notes: notes.trim(),
        presentMemberIds,
        calendarEventId,
      });
      AlertSuccess("Pauta salva com sucesso");
      onClose();
    } catch (caught) {
      AlertError("Não foi possível salvar a pauta.");
      setError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível salvar a pauta."
      );
    } finally {
      setSaving(false);
    }
  }

  const selectedMeeting = calendarMeetings.find(
    (meeting) => meeting.id === calendarEventId
  );

  return {
    titleRef,
    isEdit,
    title,
    meetingDate,
    type,
    status,
    notes,
    setNotes,
    presentMemberIds,
    setPresentMemberIds,
    calendarEventId,
    calendarMeetings,
    loadingMeetings,
    selectedMeeting,
    error,
    saving,
    handleSubmit,
    handleTypeChange,
    handleDateChange,
    handleTitleChange,
    handleCalendarMeetingChange,
    setStatus,
  };
}
