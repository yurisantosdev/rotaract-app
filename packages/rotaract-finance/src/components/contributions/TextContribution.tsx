import { formatBRL } from "../../services/money";
import React from 'react'

export type TextContributionsProps = {
  pendingCount: number
  received: number
}

export function TextContributions({ pendingCount, received }: TextContributionsProps) {
  return (
    <p className="mt-1 text-sm text-center w-full text-zinc-500">
      {pendingCount} pendente{pendingCount === 1 ? "" : "s"} · {formatBRL(received)}{" "}
      já recebidos neste mês.
    </p>
  )
}