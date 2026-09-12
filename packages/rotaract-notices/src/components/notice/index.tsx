"use client";

import { BellRingingIcon, ChecksIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { CelebrationConfetti } from "@rotaract/components";
import { noticesAdd } from "../../redux/actions";
import { ListNotices } from "../listNotices";
import { NoticesModal } from "../noticesModal";
import { useNotice } from "./services";

export function Notice() {
  const data = useNotice();
  if (!data) return null;
  const {
    panelRef,
    celebrationBurst,
    celebrate,
    setCelebrate,
    open,
    setOpen,
    unreadCount,
    badge,
    handleReadAll,
    notices,
    setOpenModal,
    dispatch,
    markingAll,
    openModal
  } = data;

  return (
    <div className="relative" ref={panelRef}>
      <CelebrationConfetti
        key={celebrationBurst}
        active={celebrate}
        onComplete={() => setCelebrate(false)}
      />
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
          className="fixed inset-x-4 top-16 z-50 mt-2 flex max-h-[min(28rem,calc(100dvh-5.5rem))] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_16px_40px_rgba(24,24,27,0.12)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:w-96"
        >
          <div className="shrink-0 border-b border-zinc-100 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p
                  id="notices-dialog-title"
                  className="text-xs font-medium uppercase tracking-[0.24em] text-rotaract-pink"
                >
                  Notificações
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {unreadCount > 0
                    ? `${unreadCount} ${unreadCount === 1 ? "não lida" : "não lidas"}`
                    : "Tudo em dia"}
                </p>
              </div>

              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={() => void handleReadAll()}
                  disabled={markingAll}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 disabled:cursor-wait disabled:opacity-60"
                >
                  <ChecksIcon className="h-3.5 w-3.5" weight="bold" aria-hidden />
                  {markingAll ? "Marcando..." : "Ler todas"}
                </button>
              ) : null}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            <ListNotices notices={notices} />
          </div>

          <div className="shrink-0 border-t border-zinc-100 p-3">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setOpenModal(true);
              }}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white text-sm font-medium text-zinc-700 transition hover:border-rotaract-pink/40 hover:bg-rotaract-pink/5 hover:text-rotaract-pink"
            >
              <PlusIcon className="h-4 w-4" weight="bold" aria-hidden />
              Criar notificação
            </button>
          </div>
        </div>
      ) : null}

      <NoticesModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreated={(created) => {
          created.forEach((notice) => {
            dispatch(noticesAdd(notice));
          });
        }}
      />
    </div>
  );
}
