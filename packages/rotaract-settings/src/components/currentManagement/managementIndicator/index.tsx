"use client";

import { useViewingManagement } from "../viewingManagement";

export function Management() {
  const { viewingManagement } = useViewingManagement();

  if (!viewingManagement) return null;

  return (
    <p
      className="max-w-28 truncate rounded-full bg-rotaract-mist px-3 py-1.5 text-xs font-semibold text-zinc-800 select-none sm:max-w-none"
      title="Gestão em visualização"
    >
      {viewingManagement}
    </p>
  );
}
