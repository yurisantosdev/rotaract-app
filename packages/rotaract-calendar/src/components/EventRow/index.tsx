import React from 'react'
import { eventKindLabel } from '../../types/event';
import { formatEventTimeRange } from '../../lib/dates';
import { EventRowProps } from './types';
import { useEventRow } from './services';

export function EventRow({
  event,
  now,
  dateLabel,
}: EventRowProps) {

  const data = useEventRow({ event, now });

  if (!data) return null;

  const {
    ended,
    kindStyles
  } = data;

  return (
    <li>
      <div
        className={`flex items-start gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 px-3 py-3 ${ended ? "opacity-55" : ""
          }`}
      >
        <span
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${kindStyles.dot}`}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-medium text-zinc-900">{event.title}</p>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${kindStyles.chip}`}
            >
              {eventKindLabel(event.kind)}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-zinc-500">
            {dateLabel ? `${dateLabel} · ` : null}
            {formatEventTimeRange(event.startsAt, event.endsAt, event.allDay)}
          </p>
        </div>
      </div>
    </li>
  );
}