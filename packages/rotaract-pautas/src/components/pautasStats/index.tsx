"use client";

import type { PautasStatsProps } from "./type";
import { StatCard } from "./_components/StatCard";
import { usePautasStats } from "./services";

export function PautasStats({ pautas }: PautasStatsProps) {
  const data = usePautasStats({ pautas });
  if (!data) return null;
  const { scheduled, realized, withoutPdf } = data;

  return (
    <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        title="Pautas"
        value={pautas.length}
        description="Cadastradas no clube"
      />
      <StatCard
        title="Agendadas"
        value={scheduled}
        description="Reuniões à frente"
      />
      <StatCard
        title="Realizadas"
        value={realized}
        description="Já aconteceram"
      />
      <StatCard
        title="Sem PDF"
        value={withoutPdf}
        description="Ainda não geradas"
      />
    </section>
  );
}
