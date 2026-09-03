"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { DatePickerProps } from "../types/datePicker";
import { TimePanel } from "./time-select";

const QUICK_OPTIONS = [
  { label: "Hoje", days: 0 },
  { label: "Amanhã", days: 1 },
  { label: "+7 dias", days: 7 },
] as const;

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"] as const;

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

function toInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseInputValue(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  next.setHours(12, 0, 0, 0);
  return next;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function buildMonthGrid(visibleMonth: Date): Date[] {
  const first = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1, 12, 0, 0, 0);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    day.setHours(12, 0, 0, 0);
    return day;
  });
}

export function DatePicker({
  id,
  value,
  onChange,
  disabled = false,
  baseDate,
  fixedPopover = false,
  showQuickOptions = false,
  labelFormat = "short",
  showTime = false,
  time = "19:30",
  onTimeChange,
  timeLabel = "Horário",
  minuteStep = 15,
  allowClear = true,
  showToday = true,
  placeholder = "Selecione uma data",
}: DatePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number } | null>(
    null
  );

  const today = useMemo(() => {
    const now = new Date();
    now.setHours(12, 0, 0, 0);
    return now;
  }, []);

  const reference = useMemo(() => {
    const parsed = baseDate ? parseInputValue(baseDate) : null;
    if (parsed) return parsed;
    return today;
  }, [baseDate, today]);

  const selectedDate = useMemo(() => parseInputValue(value), [value]);

  const [visibleMonth, setVisibleMonth] = useState(() => {
    const anchor = selectedDate ?? reference;
    return new Date(anchor.getFullYear(), anchor.getMonth(), 1, 12, 0, 0, 0);
  });

  useEffect(() => {
    if (!open) return;
    const anchor = selectedDate ?? reference;
    setVisibleMonth(new Date(anchor.getFullYear(), anchor.getMonth(), 1, 12, 0, 0, 0));
  }, [open, reference, selectedDate]);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      if (!fixedPopover || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const popoverWidth = showTime ? 380 : 288;
      const popoverHeight = showTime ? 360 : 340;
      const gap = 8;
      const padding = 12;
      let top = rect.bottom + gap;
      let left = rect.left;

      if (top + popoverHeight > window.innerHeight - padding) {
        top = Math.max(padding, rect.top - popoverHeight - gap);
      }
      if (left + popoverWidth > window.innerWidth - padding) {
        left = window.innerWidth - popoverWidth - padding;
      }
      if (left < padding) left = padding;

      setPopoverPosition({ top, left });
    }

    updatePosition();

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !target.closest("[data-date-picker-popover]")
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setOpen(false);
    }

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [fixedPopover, open, showTime]);

  const quickValues = useMemo(
    () =>
      QUICK_OPTIONS.map((option) => ({
        ...option,
        target: toInputValue(addDays(reference, option.days)),
      })),
    [reference]
  );

  const monthGrid = useMemo(() => buildMonthGrid(visibleMonth), [visibleMonth]);

  function pickDate(date: Date) {
    onChange(toInputValue(date));
    if (!showTime) setOpen(false);
  }

  const dateLabel = selectedDate
    ? labelFormat === "short"
      ? formatShortDate(selectedDate)
      : formatLongDate(selectedDate)
    : placeholder;

  const popover = open ? (
    <div
      data-date-picker-popover=""
      className={[
        "rounded-[1.25rem] border border-zinc-200/80 bg-white p-3 shadow-[0_24px_80px_rgba(24,24,27,0.18)] ring-1 ring-black/5",
        showTime ? "w-[23.5rem] max-w-[calc(100vw-1.5rem)]" : "w-72",
        fixedPopover ? "fixed z-[80]" : "absolute left-0 top-full z-30 mt-2",
      ].join(" ")}
      style={
        fixedPopover && popoverPosition
          ? { top: popoverPosition.top, left: popoverPosition.left }
          : undefined
      }
    >
      <div className={showTime ? "flex gap-3" : ""}>
        <div className={showTime ? "min-w-0 flex-1" : ""}>
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="Mês anterior"
              onClick={() =>
                setVisibleMonth(
                  new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1, 12, 0, 0, 0)
                )
              }
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-zinc-500 transition hover:bg-rotaract-mist hover:text-zinc-900"
            >
              <ChevronLeftIcon />
            </button>
            <p className="text-sm font-semibold text-zinc-900">
              {MONTHS[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
            </p>
            <button
              type="button"
              aria-label="Próximo mês"
              onClick={() =>
                setVisibleMonth(
                  new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1, 12, 0, 0, 0)
                )
              }
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl text-zinc-500 transition hover:bg-rotaract-mist hover:text-zinc-900"
            >
              <ChevronRightIcon />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((label, index) => (
              <div
                key={`${label}-${index}`}
                className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-zinc-400"
              >
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {monthGrid.map((day) => {
              const inCurrentMonth = day.getMonth() === visibleMonth.getMonth();
              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
              const isToday = isSameDay(day, today);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => pickDate(day)}
                  className={[
                    "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-xs font-medium transition",
                    isSelected
                      ? "bg-rotaract-pink text-white"
                      : isToday
                        ? "bg-rotaract-pink/10 text-rotaract-pink ring-1 ring-rotaract-pink/30"
                        : inCurrentMonth
                          ? "text-zinc-700 hover:bg-rotaract-mist"
                          : "text-zinc-300 hover:bg-zinc-50",
                  ].join(" ")}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {showTime ? (
          <div className="flex w-[4.75rem] shrink-0 flex-col border-l border-zinc-100 pl-3">
            <p className="mb-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
              {timeLabel}
            </p>
            <div className="h-[16.5rem]">
              <TimePanel
                value={time}
                disabled={disabled}
                minuteStep={minuteStep}
                onChange={(next) => {
                  onTimeChange?.(next);
                  setOpen(false);
                }}
              />
            </div>
          </div>
        ) : null}
      </div>

      {showToday || showTime || (allowClear && value) ? (
        <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3">
          {showToday ? (
            <button
              type="button"
              onClick={() => pickDate(today)}
              className="cursor-pointer text-xs font-semibold text-rotaract-pink transition hover:text-rotaract-magenta"
            >
              Hoje
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3">
            {allowClear && value ? (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="cursor-pointer text-xs font-medium text-zinc-400 transition hover:text-zinc-700"
              >
                Limpar
              </button>
            ) : null}
            {showTime ? (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="cursor-pointer rounded-full bg-rotaract-pink px-3 py-1 text-xs font-semibold text-white transition hover:bg-rotaract-magenta"
              >
                Pronto
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  ) : null;

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={[
          "flex h-12 w-full items-center gap-2.5 rounded-2xl border bg-zinc-50 px-4 text-left text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60",
          open
            ? "border-rotaract-pink/50 bg-white ring-4 ring-rotaract-pink/20"
            : "border-zinc-200 hover:border-zinc-300",
        ].join(" ")}
      >
        <span className="shrink-0 text-zinc-400">
          <CalendarIcon />
        </span>
        <span
          className={[
            "min-w-0 truncate",
            selectedDate
              ? labelFormat === "short"
                ? "text-zinc-900"
                : "capitalize text-zinc-900"
              : "text-zinc-400",
          ].join(" ")}
        >
          {dateLabel}
        </span>
        {showTime && time ? (
          <>
            <span className="text-zinc-300" aria-hidden>
              ·
            </span>
            <span className="shrink-0 text-zinc-400">
              <ClockIcon />
            </span>
            <span className="shrink-0 tabular-nums text-zinc-900">{time}</span>
          </>
        ) : null}
      </button>

      {showQuickOptions ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {quickValues.map((option) => {
            const isActive = value === option.target;
            return (
              <button
                key={option.label}
                type="button"
                disabled={disabled}
                onClick={() => onChange(option.target)}
                className={[
                  "cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition disabled:cursor-not-allowed disabled:opacity-40",
                  isActive
                    ? "bg-rotaract-pink text-white ring-rotaract-pink"
                    : "bg-white text-zinc-600 ring-zinc-200 hover:bg-rotaract-mist hover:text-zinc-900",
                ].join(" ")}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}

      {popover &&
        (fixedPopover && typeof document !== "undefined"
          ? createPortal(popover, document.body)
          : popover)}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
