import React from "react";
import { ClubSettings } from "../../types/settings";

export function PreView({
  clubName,
  logoUrl,
}: ClubSettings) {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-rotaract-mist/70 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
        Pré-visualização
      </p>
      <div className="mt-3 flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-full w-full object-contain p-1" />
          ) : (
            <span className="text-xs font-semibold text-rotaract-pink">
              {clubName.trim().slice(0, 2).toUpperCase() || "RC"}
            </span>
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-900">
            {clubName.trim() || "Nome do clube"}
          </p>
          <p className="text-xs text-zinc-500">
            Assim o clube aparece no topo do aplicativo.
          </p>
        </div>
      </div>
    </div>
  );
}
