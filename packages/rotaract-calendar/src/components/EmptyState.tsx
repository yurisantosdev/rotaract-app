import React from "react";

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-200 px-4 py-8 text-center">
      <p className="text-sm font-medium text-zinc-800">{message}</p>
    </div>
  );
}