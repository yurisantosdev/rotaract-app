import type { Member } from "../types/member";
import { isBoardRole } from "../types/member";

type MembersStatsProps = {
  members: Member[];
};

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 sm:rounded-3xl sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {title}
      </p>
      <p className="mt-2 text-xl font-semibold tabular-nums text-zinc-900 sm:text-2xl">
        {value}
      </p>
      <p className="mt-2 text-sm text-zinc-500">{description}</p>
    </article>
  );
}

export function MembersStats({ members }: MembersStatsProps) {
  const active = members.filter((member) => member.status === "ativo").length;
  const board = members.filter((member) => isBoardRole(member.role)).length;
  const inactive = members.filter((member) => member.status === "inativo").length;

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
