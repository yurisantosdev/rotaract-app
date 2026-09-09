import { ArrowRightIcon } from '@phosphor-icons/react';
import React, { ReactNode } from 'react'

export function CardModule({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action: string;
}) {
  return (
    <>
      <span className="flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rotaract-pink/10 text-rotaract-pink transition group-hover:bg-rotaract-pink group-hover:text-white group-hover:shadow-[0_10px_28px_rgba(255,45,122,0.28)]">
          {icon}
        </span>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
          Disponível
        </span>
      </span>
      <span className="mt-5 block">
        <span className="block text-lg font-semibold tracking-tight text-zinc-900">
          {title}
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-zinc-500">
          {description}
        </span>
      </span>
      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-rotaract-pink">
        {action}
        <ArrowRightIcon
          className="h-4 w-4"
        />
      </span>
    </>
  );
}