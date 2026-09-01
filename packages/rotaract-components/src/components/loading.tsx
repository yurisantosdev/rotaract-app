import React from "react";

export function Loading() {
  return (
    <div
      className="rotaract-modal-backdrop fixed inset-0 z-50 flex cursor-wait items-center justify-center bg-white/40 backdrop-blur-md"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-4">
        <span
          className="h-11 w-11 animate-spin rounded-full border-[3px] border-zinc-200 border-t-rotaract-pink motion-reduce:animate-none"
          aria-hidden
        />
        <p className="text-sm font-semibold tracking-wide text-zinc-800">
          Carregando...
        </p>
      </div>
    </div>
  );
}
