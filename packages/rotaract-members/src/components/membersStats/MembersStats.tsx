"use client";

import { MembersStatsProps } from "./type";
import { StatCard } from "./_components/StatCard";
import { useMembersStats } from "./services";

export function MembersStats({ members }: MembersStatsProps) {
  const data = useMembersStats({ members });
  if (!data) return null;
  const {
    active,
    board,
    inactive
  } = data;

  return (
    <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        title="Membros"
        value={members.length}
        description="Cadastro atual do clube"
      />
      <StatCard
        title="Ativos"
        value={active}
        description="Participando neste ano"
      />
      <StatCard
        title="Diretoria"
        value={board}
        description="Cargos da gestão atual"
      />
      <StatCard
        title="Inativos"
        value={inactive}
        description="Fora da frequência agora"
      />
    </section>
  );
}
