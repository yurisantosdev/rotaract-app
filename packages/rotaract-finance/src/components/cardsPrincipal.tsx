import React from 'react'
import { Card } from './card'
import { formatBRL } from '../services/money'

export function CardsPrincipal({ totals }: any) {
  return (
    <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Card
        title="Saldo atual"
        number={totals.balance}
        colorNumber="black"
      />

      <Card
        title="Entradas no mês"
        number={totals.monthIncome}
        colorNumber="green"
      />

      <Card
        title="Saídas no mês"
        number={totals.monthExpense}
        colorNumber="red"
      />

      <Card
        title="Mensalidades abertas"
        number={totals.pendingCount}
        colorNumber="black"
        description={`${formatBRL(totals.pendingValue)} a receber`}
      />
    </section>
  )
}