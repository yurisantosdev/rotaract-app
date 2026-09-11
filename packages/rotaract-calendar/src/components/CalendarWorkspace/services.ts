"use client";

import { MONTH_LABELS, buildMonthGrid, eventOccursOnDay } from "../../lib/dates";
import { CalendarEvent, CalendarEventPayload, EventKind } from "../../types/event";
import { Member } from "@rotaract/members";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePagination } from "@rotaract/components";
import { UseCalendarWorkspaceProps } from "./types";

export function useCalendarWorkspace({ events, onUpdate, onCreate }: UseCalendarWorkspaceProps) {
  function membersForEvent(event: CalendarEvent, members: Member[]): Member[] {
    return event.memberIds
      .map((id) => members.find((member) => member.id === id))
      .filter((member): member is Member => Boolean(member));
  }

  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<CalendarEvent | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ top: number; left: number } | null>(null);
  const [kindFilter, setKindFilter] = useState<EventKind | null>(null);
  const hoverHideTimeout = useRef<number | null>(null);

  const monthGrid = useMemo(() => buildMonthGrid(visibleMonth), [visibleMonth]);
  const today = useMemo(() => new Date(), []);

  const visibleEvents = useMemo(
    () => (kindFilter ? events.filter((event) => event.kind === kindFilter) : events),
    [events, kindFilter]
  );

  const selectedDayEvents = useMemo(
    () =>
      visibleEvents
        .filter((event) => eventOccursOnDay(event.startsAt, event.endsAt, selectedDate))
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    [visibleEvents, selectedDate]
  );

  const selectedDayPagination = usePagination(selectedDayEvents, {
    resetKey: `${selectedDate.toDateString()}|${kindFilter ?? "todos"}`,
  });

  useEffect(() => {
    return () => {
      if (hoverHideTimeout.current) window.clearTimeout(hoverHideTimeout.current);
    };
  }, []);

  function showEventPreview(event: CalendarEvent, target: HTMLElement) {
    if (hoverHideTimeout.current) window.clearTimeout(hoverHideTimeout.current);
    const rect = target.getBoundingClientRect();
    setHoveredEvent(event);
    setHoverPosition({ top: rect.top, left: rect.left + rect.width / 2 });
  }

  function hideEventPreview() {
    hoverHideTimeout.current = window.setTimeout(() => {
      setHoveredEvent(null);
      setHoverPosition(null);
    }, 80);
  }

  function goToPreviousMonth() {
    setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1));
  }

  function goToNextMonth() {
    setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1));
  }

  function goToToday() {
    const now = new Date();
    setVisibleMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  }

  function openCreateForm(day?: Date) {
    if (day) setSelectedDate(day);
    setEditingEvent(null);
    setFormOpen(true);
  }

  function openEditForm(event: CalendarEvent) {
    setEditingEvent(event);
    setSelectedDate(new Date(event.startsAt));
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingEvent(null);
  }

  function handleSave(payload: CalendarEventPayload) {
    if (editingEvent) {
      return onUpdate(editingEvent.id, payload);
    }
    return onCreate(payload);
  }

  const monthLabel = MONTH_LABELS[visibleMonth.getMonth()] ?? "";

  return {
    membersForEvent,
    monthLabel,
    visibleMonth,
    selectedDate,
    formOpen,
    editingEvent,
    eventToDelete,
    hoveredEvent,
    hoverPosition,
    kindFilter,
    handleSave,
    closeForm,
    openCreateForm,
    openEditForm,
    showEventPreview,
    hideEventPreview,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    visibleEvents,
    setSelectedDate,
    selectedDayPagination,
    monthGrid,
    today,
    setHoveredEvent,
    setHoverPosition,
    setKindFilter,
    selectedDayEvents,
    setEventToDelete
  };
}
