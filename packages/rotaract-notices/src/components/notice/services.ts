"use client";

import { readAllNotices } from "../../../src/services/database.notices.services";
import { loadNotices, noticesUpdate, useNotices } from "../../../src";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";

export function useNotice() {
  const dispatch = useDispatch();
  const notices = useNotices();
  const [open, setOpen] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [markingAll, setMarkingAll] = useState<boolean>(false);
  const [celebrate, setCelebrate] = useState(false);
  const [celebrationBurst, setCelebrationBurst] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const unreadCount = notices.filter((notice) => !notice.read).length;
  const badge = unreadCount > 5 ? "+5" : String(unreadCount);

  useEffect(() => {
    function refreshNotices() {
      if (document.hidden || markingAll) {
        return;
      }

      void dispatch<any>(loadNotices({ force: true }));
    }

    const intervalId = window.setInterval(refreshNotices, 3000);
    document.addEventListener("visibilitychange", refreshNotices);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refreshNotices);
    };
  }, [dispatch, markingAll]);

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
      const updated = await Promise.all(
        unreadIds.map((id) => readAllNotices(id, controller.signal))
      );
      updated.forEach((notice) => {
        dispatch(noticesUpdate(notice));
      });
      setCelebrate(true);
      setCelebrationBurst((burst) => burst + 1);
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
    } finally {
      setMarkingAll(false);
    }
  }

  return {
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
  };
}
