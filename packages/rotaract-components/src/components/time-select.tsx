"use client";

import { type KeyboardEvent as ReactKeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { TimeSelectProps } from "../types/timeSelect";

function buildTimeOptions(step: number): string[] {
  const options: string[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += step) {
    const hour = String(Math.floor(minutes / 60)).padStart(2, "0");
    const minute = String(minutes % 60).padStart(2, "0");
    options.push(`${hour}:${minute}`);
  }
  return options;
}

function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function isValidTime(hour: number, minute: number): boolean {
  return hour >= 0 && hour < 24 && minute >= 0 && minute < 60;
}

function parseTimeInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const colonMatch = trimmed.match(/^(\d{1,2}):(\d{1,2})$/);
  if (colonMatch) {
    const hour = Number(colonMatch[1]);
    const minute = Number(colonMatch[2]);
    return isValidTime(hour, minute) ? formatTime(hour, minute) : null;
  }

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 3) {
    const hour = Number(digits.slice(0, 1));
    const minute = Number(digits.slice(1));
    return isValidTime(hour, minute) ? formatTime(hour, minute) : null;
  }

  if (digits.length === 4) {
    const hour = Number(digits.slice(0, 2));
    const minute = Number(digits.slice(2));
    return isValidTime(hour, minute) ? formatTime(hour, minute) : null;
  }

  return null;
}

function filterTimeOptions(options: string[], query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return options;

  const digits = trimmed.replace(/\D/g, "");
  return options.filter((option) => {
    if (option.includes(trimmed)) return true;
    if (!digits) return true;
    return option.replace(":", "").startsWith(digits);
  });
}

export function TimePanel({
  value,
  onChange,
  disabled = false,
  minuteStep = 15,
}: Pick<TimeSelectProps, "value" | "onChange" | "disabled" | "minuteStep">) {
  const listRef = useRef<HTMLDivElement>(null);
  const options = useMemo(() => buildTimeOptions(minuteStep ?? 15), [minuteStep]);

  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>("[data-active='true']");
    if (!list || !active) return;
    list.scrollTop = active.offsetTop - list.clientHeight / 2 + active.clientHeight / 2;
  }, []);

  return (
    <div ref={listRef} className="h-full overflow-y-auto overscroll-contain pr-0.5">
      {options.map((option) => {
        const isActive = option === value;
        return (
          <button
            key={option}
            type="button"
            data-active={isActive}
            disabled={disabled}
            onClick={() => onChange(option)}
            className={[
              "flex h-8 w-full cursor-pointer items-center justify-center rounded-lg text-xs font-medium tabular-nums transition disabled:cursor-not-allowed disabled:opacity-40",
              isActive
                ? "bg-rotaract-pink text-white"
                : "text-zinc-600 hover:bg-rotaract-mist hover:text-zinc-900",
            ].join(" ")}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export function TimeSelect({
  id,
  value,
  onChange,
  disabled = false,
  fixedPopover = false,
  minuteStep = 15,
}: TimeSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [popoverPosition, setPopoverPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const options = useMemo(() => buildTimeOptions(minuteStep), [minuteStep]);
  const parsedInput = useMemo(() => parseTimeInput(inputValue), [inputValue]);
  const filteredOptions = useMemo(() => {
    const filtered = filterTimeOptions(options, inputValue);
    if (parsedInput && !filtered.includes(parsedInput)) {
      return [parsedInput, ...filtered];
    }
    return filtered;
  }, [inputValue, options, parsedInput]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      if (!fixedPopover || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const width = rect.width;
      const estimatedHeight = 240;
      const gap = 8;
      const padding = 12;
      let top = rect.bottom + gap;
      let left = rect.left;

      if (top + estimatedHeight > window.innerHeight - padding) {
        top = Math.max(padding, rect.top - estimatedHeight - gap);
      }
      if (left + width > window.innerWidth - padding) {
        left = window.innerWidth - width - padding;
      }
      if (left < padding) left = padding;

      setPopoverPosition({ top, left, width });
    }

    updatePosition();

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !target.closest("[data-time-select-popover]")
      ) {
        commitInput();
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setInputValue(value);
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
  }, [fixedPopover, open, value, inputValue]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const active = listRef.current.querySelector("[data-active='true']");
    if (active) active.scrollIntoView({ block: "center" });
  }, [filteredOptions, open]);

  function commitInput() {
    const parsed = parseTimeInput(inputValue);
    if (parsed) {
      onChange(parsed);
      setInputValue(parsed);
      return;
    }
    setInputValue(value);
  }

  function pickTime(time: string) {
    onChange(time);
    setInputValue(time);
    setOpen(false);
  }

  function handleInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      if (filteredOptions[0]) {
        pickTime(filteredOptions[0]);
        return;
      }
      commitInput();
      setOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
    }

    if (event.key === "Escape") {
      event.stopPropagation();
      setInputValue(value);
      setOpen(false);
    }
  }

  const showPopover = open && (filteredOptions.length > 0 || Boolean(parsedInput));

  const popover = showPopover ? (
    <div
      data-time-select-popover=""
      className={[
        "rounded-2xl border border-zinc-200/80 bg-white p-1.5 shadow-xl ring-1 ring-black/5",
        fixedPopover ? "fixed z-[80]" : "absolute left-0 top-full z-30 mt-2 w-full",
      ].join(" ")}
      style={
        fixedPopover && popoverPosition
          ? {
              top: popoverPosition.top,
              left: popoverPosition.left,
              width: popoverPosition.width,
            }
          : undefined
      }
    >
      <div ref={listRef} className="max-h-56 overflow-y-auto">
        {filteredOptions.length === 0 ? (
          <p className="px-3 py-2 text-sm text-zinc-500">Nenhum horário encontrado.</p>
        ) : (
          filteredOptions.map((option) => {
            const isActive = option === value || option === parsedInput;
            return (
              <button
                key={option}
                type="button"
                data-active={isActive}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => pickTime(option)}
                className={[
                  "flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm transition",
                  isActive
                    ? "bg-rotaract-pink text-white"
                    : "text-zinc-700 hover:bg-rotaract-mist",
                ].join(" ")}
              >
                {option}
              </button>
            );
          })
        )}
      </div>
    </div>
  ) : null;

  return (
    <div ref={containerRef} className="relative">
      <div
        className={[
          "flex h-12 items-center gap-2 rounded-2xl border bg-zinc-50 px-4 transition",
          open
            ? "border-rotaract-pink/50 bg-white ring-4 ring-rotaract-pink/20"
            : "border-zinc-200 hover:border-zinc-300",
          disabled ? "cursor-not-allowed opacity-60" : "",
        ].join(" ")}
      >
        <span className="shrink-0 text-zinc-400">
          <ClockIcon />
        </span>
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="numeric"
          value={inputValue}
          disabled={disabled}
          placeholder="19:30"
          onChange={(event) => {
            setInputValue(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            commitInput();
            setOpen(false);
          }}
          onKeyDown={handleInputKeyDown}
          className="min-w-0 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => {
            setOpen((current) => !current);
            inputRef.current?.focus();
          }}
          className="shrink-0 cursor-pointer text-zinc-400 transition hover:text-zinc-600 disabled:cursor-not-allowed"
          aria-label="Abrir horários"
        >
          <ChevronIcon open={open} />
        </button>
      </div>

      {popover &&
        (fixedPopover && typeof document !== "undefined"
          ? createPortal(popover, document.body)
          : popover)}
    </div>
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

function ChevronIcon({ open }: { open: boolean }) {
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
      className={open ? "rotate-180 transition" : "transition"}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
