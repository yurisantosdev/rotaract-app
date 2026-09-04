"use client";

import { useEffect, useId, useRef, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { ConfirmModalProps } from "../types/confirmModal";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  loading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const loadingRef = useRef(loading);
  onCloseRef.current = onClose;
  loadingRef.current = loading;

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      cancelRef.current?.focus();
    });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        if (!loadingRef.current) onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const nodes = [
        ...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ].filter((node) => !node.hasAttribute("disabled") && node.tabIndex !== -1);

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open]);

  function handleClose() {
    if (loading) return;
    onClose();
  }

  function handleBackdropMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) handleClose();
  }

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/45 p-3 backdrop-blur-md sm:items-center sm:p-6"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        aria-busy={loading || undefined}
        className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-[0_24px_80px_rgba(24,24,27,0.22)]"
      >
        <div className="px-5 py-5 sm:px-6 sm:py-6">
          <h2
            id={titleId}
            className="text-xl font-semibold tracking-tight text-zinc-900"
          >
            {title}
          </h2>
          {description ? (
            <p
              id={descriptionId}
              className="mt-2 text-sm leading-relaxed text-zinc-500"
            >
              {description}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              ref={cancelRef}
              type="button"
              disabled={loading}
              onClick={handleClose}
              className="h-12 rounded-full px-5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-wait disabled:opacity-60 disabled:hover:bg-transparent"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              disabled={loading}
              aria-busy={loading || undefined}
              onClick={() => {
                if (loading) return;
                onConfirm();
              }}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-rose-500 px-5 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-wait disabled:opacity-80 disabled:hover:bg-rose-500"
            >
              {loading ? (
                <span
                  className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/35 border-t-white motion-reduce:animate-none"
                  aria-hidden
                />
              ) : null}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
