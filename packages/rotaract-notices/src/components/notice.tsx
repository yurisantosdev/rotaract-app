"use client";

import { BellRingingIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { listNotices, readAllNotices } from "../services/notices";
import type { Notices } from "../types/notices";
import { NoticesModal } from "./notices-modal";
import { ListNotices } from "./listNotices";

export function Notice() {
  const [notices, setNotices] = useState<Notices[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [markingAll, setMarkingAll] = useState<boolean>(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const unreadCount = notices.filter((notice) => !notice.read).length;
  const badge = unreadCount > 5 ? "+5" : String(unreadCount);

  useEffect(() => {
    const controller = new AbortController();

    listNotices(controller.signal)
      .then(setNotices)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setNotices([]);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function onPointerDown(event: PointerEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  async function handleReadAll() {
    const unreadIds = notices
      .filter((notice) => !notice.read)
      .map((notice) => notice.id);

    if (unreadIds.length === 0 || markingAll) {
      return;
    }

    const controller = new AbortController();
    setMarkingAll(true);

    try {
      await Promise.all(
        unreadIds.map((id) => readAllNotices(id, controller.signal))
      );
      setNotices((current) =>
        current.map((notice) =>
          unreadIds.includes(notice.id) ? { ...notice, read: true } : notice
        )
      );
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        className="relative inline-flex cursor-pointer items-center justify-center"
        aria-label={unreadCount > 0 ? `Notificações (${badge})` : "Notificações"}
        title="Notificações"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="relative block h-6 w-6" aria-hidden>
          <span
            className={`absolute inset-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${open
              ? "pointer-events-none scale-50 rotate-90 opacity-0"
              : "scale-100 rotate-0 opacity-100"
              }`}
          >
            <BellRingingIcon size={24} />
          </span>
          <span
            className={`absolute inset-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${open
              ? "scale-100 rotate-0 opacity-100"
              : "pointer-events-none scale-50 -rotate-90 opacity-0"
              }`}
          >
            <XIcon size={24} />
          </span>
        </span>
        {unreadCount > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rotaract-pink px-1 text-[10px] font-bold leading-none text-white">
            {badge}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-labelledby="notices-dialog-title"
          className="absolute right-0 top-full z-50 mt-2 w-96 rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_16px_40px_rgba(24,24,27,0.12)]"
        >
          <div className="flex items-center justify-between gap-2">
            <p
              id="notices-dialog-title"
              className="text-xs font-medium uppercase tracking-[0.24em] text-rotaract-pink"
            >
              Notificações
            </p>

            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => void handleReadAll()}
                disabled={markingAll}
                className="text-xs font-medium text-rotaract-pink transition hover:text-rotaract-magenta disabled:cursor-wait disabled:opacity-60 hover:underline"
              >
                {markingAll ? "Marcando..." : "Ler todas"}
              </button>
            ) : null}
          </div>

          <div className="mt-2 w-full flex justify-end items-center">
            <p
              className="text-sm font-medium text-rotaract-pink transition hover:text-rotaract-magenta disabled:cursor-wait disabled:opacity-60 hover:underline cursor-pointer"
              onClick={() => {
                setOpen(false);
                setOpenModal(true)
              }}
            >
              Criar notificação
            </p>
          </div>

          <ListNotices notices={notices} />
        </div>
      ) : null}

      <NoticesModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreated={(created) => {
          setNotices((current) => [...created, ...current]);
        }}
      />
    </div>
  );
}
