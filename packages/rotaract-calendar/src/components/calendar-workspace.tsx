"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CaretLeftIcon,
  CaretRightIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Button, ConfirmModal, Tooltip } from "@rotaract/components";
import { EventFormModal } from "./event-form-modal";
import { MemberAvatar } from "@rotaract/members";
import {
  MONTH_LABELS,
  WEEKDAY_LABELS,
  buildMonthGrid,
  eventOccursOnDay,
  formatEventDate,
  formatEventTimeRange,
  isSameDay,
} from "../lib/dates";
import type { Member } from "../types/calendar";
import {
  EVENT_KINDS,
  EVENT_KIND_STYLES,
  eventKindLabel,
  type CalendarEvent,
  type CalendarEventPayload,
  type EventKind,
} from "../types/event";

type CalendarWorkspaceProps = {
  events: CalendarEvent[];
  members: Member[];
  currentUserId?: string;
  onCreate: (payload: CalendarEventPayload) => void | Promise<void>;
  onUpdate: (id: string, payload: CalendarEventPayload) => void | Promise<void>;
  onRemove: (id: string) => void | Promise<void>;
};

function membersForEvent(event: CalendarEvent, members: Member[]): Member[] {
  return event.memberIds
    .map((id) => members.find((member) => member.id === id))
    .filter((member): member is Member => Boolean(member));
}

export function CalendarWorkspace({
  events,
  members,
  currentUserId,
  onCreate,
  onUpdate,
  onRemove,
}: CalendarWorkspaceProps) {
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

  return (
    <section className="mt-8 flex flex-col gap-4 lg:flex-row">
      <div className="min-w-0 flex-1 rounded-3xl border border-zinc-200 bg-white p-4 shadow-[0_12px_40px_rgba(24,24,27,0.04)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full md:text-start text-center">
            <h2 className="text-lg font-semibold text-zinc-900 sm:text-xl">
              {monthLabel} {visibleMonth.getFullYear()}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Eventos, reuniões e compromissos do clube.
            </p>
          </div>

          <div className="flex justify-between items-center gap-2">
            <button
              type="button"
              onClick={goToToday}
              className="h-10 rounded-full border border-zinc-200 px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              Hoje
            </button>

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={goToPreviousMonth}
                aria-label="Mês anterior"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 transition hover:bg-zinc-50"
              >
                <CaretLeftIcon className="h-4 w-4" weight="bold" />
              </button>
              <button
                type="button"
                onClick={goToNextMonth}
                aria-label="Próximo mês"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 transition hover:bg-zinc-50"
              >
                <CaretRightIcon className="h-4 w-4" weight="bold" />
              </button>
            </div>

            <Tooltip label="Novo evento">
              <Button
                aria-label="Novo evento"
                icon={<PlusIcon className="h-5 w-5" />}
                onClick={() => openCreateForm(selectedDate)}
              />
            </Tooltip>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-7 gap-1">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="px-1 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-zinc-400"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {monthGrid.map((day) => {
            const dayEvents = visibleEvents.filter((event) =>
              eventOccursOnDay(event.startsAt, event.endsAt, day)
            );
            const inCurrentMonth = day.getMonth() === visibleMonth.getMonth();
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, today);

            return (
              <div
                key={day.toISOString()}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedDate(day)}
                onDoubleClick={() => openCreateForm(day)}
                onKeyDown={(keyEvent) => {
                  if (keyEvent.key === "Enter" || keyEvent.key === " ") {
                    keyEvent.preventDefault();
                    setSelectedDate(day);
                  }
                }}
                className={[
                  "flex min-h-[5.5rem] cursor-pointer flex-col overflow-hidden rounded-xl border p-1 text-left transition sm:min-h-[6.5rem] sm:rounded-2xl sm:p-1.5",
                  inCurrentMonth ? "bg-white" : "bg-zinc-50/80",
                  isSelected
                    ? "border-rotaract-pink ring-2 ring-rotaract-pink/15"
                    : "border-zinc-100 hover:border-zinc-300",
                ].join(" ")}
              >
                <div className="flex shrink-0 items-center justify-between">
                  <span
                    className={[
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                      isToday
                        ? "bg-rotaract-pink text-white"
                        : inCurrentMonth
                          ? "text-zinc-900"
                          : "text-zinc-400",
                    ].join(" ")}
                  >
                    {day.getDate()}
                  </span>
                  {dayEvents.length > 0 ? (
                    <span className="text-[10px] font-medium text-zinc-400">
                      {dayEvents.length}
                    </span>
                  ) : null}
                </div>

                <div className="mt-1 min-h-0 flex-1 space-y-1 overflow-hidden">
                  {dayEvents.slice(0, 2).map((event) => {
                    const isHovered = hoveredEvent?.id === event.id;
                    return (
                      <button
                        key={event.id}
                        type="button"
                        onMouseEnter={(hoverEvent) =>
                          showEventPreview(event, hoverEvent.currentTarget)
                        }
                        onMouseLeave={hideEventPreview}
                        onClick={(clickEvent) => {
                          clickEvent.stopPropagation();
                          setHoveredEvent(null);
                          setHoverPosition(null);
                          openEditForm(event);
                        }}
                        className={[
                          "block w-full truncate rounded-md px-1.5 py-0.5 text-left text-[10px] font-medium ring-1 ring-inset transition",
                          isHovered
                            ? EVENT_KIND_STYLES[event.kind].hover
                            : EVENT_KIND_STYLES[event.kind].chip,
                        ].join(" ")}
                      >
                        {event.title}
                      </button>
                    );
                  })}
                  {dayEvents.length > 2 ? (
                    <p className="text-[10px] text-zinc-400">
                      +{dayEvents.length - 2} mais
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <aside className="w-full shrink-0 rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_12px_40px_rgba(24,24,27,0.04)] lg:w-[22rem]">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          Dia selecionado
        </p>
        <h3 className="mt-1 text-lg font-semibold capitalize text-zinc-900">
          {formatEventDate(selectedDate.toISOString())}
        </h3>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setKindFilter(null)}
            aria-pressed={!kindFilter}
            className={`rounded-full px-2 py-1 text-[10px] font-semibold ring-1 ring-inset transition ${!kindFilter
              ? "bg-zinc-800 text-white ring-zinc-800"
              : "bg-zinc-100 text-zinc-600 ring-zinc-200 hover:bg-zinc-200"
              }`}
          >
            Todos
          </button>
          {EVENT_KINDS.map((item) => {
            const selected = kindFilter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setKindFilter((current) => (current === item.id ? null : item.id))
                }
                aria-pressed={selected}
                className={`rounded-full px-2 py-1 text-[10px] font-semibold ring-1 ring-inset transition ${selected
                  ? EVENT_KIND_STYLES[item.id].hover
                  : EVENT_KIND_STYLES[item.id].chip
                  }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {selectedDayEvents.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-zinc-200 px-4 py-8 text-center">
            <p className="text-sm font-medium text-zinc-800">
              {kindFilter
                ? `Nenhum ${eventKindLabel(kindFilter).toLowerCase()} neste dia.`
                : "Nenhum evento neste dia."}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {kindFilter
                ? "Troque o filtro ou cadastre um compromisso deste tipo."
                : "Dê um duplo clique no calendário ou cadastre um compromisso."}
            </p>
            <button
              type="button"
              onClick={() => openCreateForm(selectedDate)}
              className="mt-4 text-sm font-semibold text-rotaract-pink transition hover:text-rotaract-magenta"
            >
              Criar evento
            </button>
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {selectedDayEvents.map((event) => {
              const participants = membersForEvent(event, members);
              return (
                <li key={event.id}>
                  <div className="flex items-start gap-1 rounded-2xl border border-zinc-100 bg-zinc-50 p-3.5 transition hover:border-zinc-200 hover:bg-white">
                    <button
                      type="button"
                      onClick={() => openEditForm(event)}
                      className="min-w-0 flex-1 cursor-pointer text-left"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-zinc-900">{event.title}</p>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${EVENT_KIND_STYLES[event.kind].chip}`}
                        >
                          {eventKindLabel(event.kind)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-500">
                        {formatEventTimeRange(event.startsAt, event.endsAt, event.allDay)}
                      </p>
                      {event.notes ? (
                        <p className="mt-2 line-clamp-2 text-sm text-zinc-600">
                          {event.notes}
                        </p>
                      ) : null}
                      {participants.length > 0 ? (
                        <div className="mt-3 flex items-center">
                          <div className="flex -space-x-2">
                            {participants.slice(0, 4).map((member) => (
                              <span
                                key={member.id}
                                className="rounded-full ring-2 ring-white"
                              >
                                <MemberAvatar member={member} size="xs" />
                              </span>
                            ))}
                          </div>
                          <span className="ml-2 text-xs text-zinc-500">
                            {participants.length}{" "}
                            {participants.length === 1 ? "participante" : "participantes"}
                          </span>
                        </div>
                      ) : null}
                    </button>
                    <Tooltip label="Excluir">
                      <button
                        type="button"
                        aria-label={`Excluir ${event.title}`}
                        onClick={() => setEventToDelete(event)}
                        className="shrink-0 rounded-full p-1.5 text-zinc-400 transition hover:bg-rose-50 hover:text-rose-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </Tooltip>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      {hoveredEvent && hoverPosition ? (
        <div
          className="pointer-events-none fixed z-50 w-72 -translate-x-1/2 -translate-y-full pb-2"
          style={{ top: hoverPosition.top, left: hoverPosition.left }}
        >
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_16px_40px_rgba(24,24,27,0.12)]">
            <div
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold ${EVENT_KIND_STYLES[hoveredEvent.kind].header}`}
            >
              <span
                className={`inline-block h-2 w-2 rounded-full ${EVENT_KIND_STYLES[hoveredEvent.kind].dot}`}
              />
              {eventKindLabel(hoveredEvent.kind)}
            </div>
            <div className="space-y-2 px-4 py-3">
              <p className="text-sm font-semibold leading-snug text-zinc-900">
                {hoveredEvent.title}
              </p>
              <p className="text-xs text-zinc-500">
                <span className="capitalize">
                  {formatEventDate(hoveredEvent.startsAt)}
                </span>
                <span className="mx-1.5 text-zinc-300">•</span>
                {formatEventTimeRange(
                  hoveredEvent.startsAt,
                  hoveredEvent.endsAt,
                  hoveredEvent.allDay
                )}
              </p>
              {hoveredEvent.notes ? (
                <p className="line-clamp-3 text-xs leading-relaxed text-zinc-600">
                  {hoveredEvent.notes}
                </p>
              ) : null}
              {hoveredEvent.memberIds.length > 0 ? (
                <p className="text-xs text-zinc-500">
                  {hoveredEvent.memberIds.length}{" "}
                  {hoveredEvent.memberIds.length === 1
                    ? "companheiro no evento"
                    : "companheiros no evento"}
                </p>
              ) : null}
              <p className="pt-1 text-[11px] text-zinc-400">
                Clique no card ao lado para editar.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <EventFormModal
        open={formOpen}
        selectedDate={selectedDate}
        event={editingEvent}
        members={members}
        currentUserId={currentUserId}
        onClose={closeForm}
        onSave={handleSave}
      />

      <ConfirmModal
        open={Boolean(eventToDelete)}
        title="Excluir evento?"
        description={
          eventToDelete
            ? `“${eventToDelete.title}” será removido da agenda do clube.`
            : undefined
        }
        confirmLabel="Excluir"
        onClose={() => setEventToDelete(null)}
        onConfirm={() => {
          if (!eventToDelete) return;
          if (hoveredEvent?.id === eventToDelete.id) {
            setHoveredEvent(null);
            setHoverPosition(null);
          }
          onRemove(eventToDelete.id);
          if (editingEvent?.id === eventToDelete.id) closeForm();
          setEventToDelete(null);
        }}
      />
    </section>
  );
}
