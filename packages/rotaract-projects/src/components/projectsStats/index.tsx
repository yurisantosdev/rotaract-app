"use client";

import { ProjectsStatsProps } from "./type";
import { StatCard } from "./_components/StatCard";
import { useProjectsPanel } from "./services";

export function ProjectsStats({ projects, tasks }: ProjectsStatsProps) {
  const data = useProjectsPanel({ projects, tasks });
  if (!data) return null;
  const {
    inProgress,
    completed
  } = data;

  return (
    <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-3">
      <StatCard
        title="Projetos"
        value={projects.length}
        description="Cadastrados no clube"
      />
      <StatCard
        title="Em andamento"
        value={inProgress}
        description="Ainda em execução"
      />
      <StatCard
        title="Concluídos"
        value={completed}
        description="Tarefas finalizadas"
      />
    </section>
  );
}
