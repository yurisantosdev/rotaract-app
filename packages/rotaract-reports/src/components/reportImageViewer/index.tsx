"use client";

import {
  ArrowsOutIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  XIcon,
} from "@phosphor-icons/react";
import { createPortal } from "react-dom";
import { useReportImageViewer } from "./services";

type ReportImageViewerProps = {
  src: string;
  alt?: string;
};

export function ReportImageViewer({
  src,
  alt = "Print do Feedback",
}: ReportImageViewerProps) {
  const data = useReportImageViewer();
  if (!data) return null;

  const {
    open,
    setOpen,
    zoom,
    zoomIn,
    zoomOut,
    resetView,
    handleClose,
    dragging,
    offset,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel,
  } = data;

  const lightbox =
    open && typeof document !== "undefined"
      ? createPortal(
        <div
          className="fixed inset-0 z-[80] flex flex-col bg-zinc-950/90 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Visualizar print em tela cheia"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
            <p className="text-sm font-medium text-white">Print do Feedback</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Diminuir zoom"
                onClick={zoomOut}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
              >
                <MagnifyingGlassMinusIcon size={18} weight="bold" />
              </button>
              <button
                type="button"
                onClick={resetView}
                className="inline-flex h-10 min-w-14 items-center justify-center rounded-full border border-white/15 bg-white/10 px-3 text-xs font-semibold tabular-nums text-white transition hover:bg-white/20"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                aria-label="Aumentar zoom"
                onClick={zoomIn}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
              >
                <MagnifyingGlassPlusIcon size={18} weight="bold" />
              </button>
              <button
                type="button"
                aria-label="Fechar visualização"
                onClick={handleClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
              >
                <XIcon size={18} weight="bold" />
              </button>
            </div>
          </div>

          <div
            className={`relative min-h-0 flex-1 overflow-hidden ${zoom > 1
                ? dragging
                  ? "cursor-grabbing"
                  : "cursor-grab"
                : "cursor-zoom-in"
              }`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            onDoubleClick={() => {
              if (zoom > 1) resetView();
              else zoomIn();
            }}
          >
            <div
              className="flex h-full w-full items-center justify-center p-4"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transition: dragging ? "none" : "transform 120ms ease-out",
              }}
            >
              <img
                src={src}
                alt={alt}
                draggable={false}
                className="max-h-[min(85vh,900px)] max-w-[min(92vw,1200px)] select-none object-contain"
              />
            </div>
          </div>

          <p className="shrink-0 px-4 py-3 text-center text-xs text-white/60 sm:px-6">
            Scroll ou botões para aproximar · arraste para mover · Esc para
            fechar
          </p>
        </div>,
        document.body
      )
      : null;

  return (
    <>
      <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
        <div className="flex items-center justify-between gap-2 border-b border-zinc-200 px-4 py-2">
          <p className="text-xs text-zinc-500">Print anexado</p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-rotaract-pink transition hover:bg-rotaract-pink/10"
          >
            <ArrowsOutIcon size={14} weight="bold" />
            Tela cheia
          </button>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="block w-full p-3 text-left transition hover:bg-zinc-100/80"
          aria-label="Abrir print em tela cheia"
        >
          <img
            src={src}
            alt={alt}
            className="mx-auto block max-h-56 max-w-full rounded-xl object-contain"
          />
        </button>
      </div>
      {lightbox}
    </>
  );
}
