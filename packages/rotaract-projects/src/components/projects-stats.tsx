import {
  getProjectStatus,
  getProjectTasks,
  type Project,
} from "../types/projects";
import { type Task } from "../types/tasks";

type ProjectsStatsProps = {
  projects: Project[];
  tasks: Task[];
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

export function ProjectsStats({ projects, tasks }: ProjectsStatsProps) {
  const inProgress = projects.filter((project) => {
    const status = getProjectStatus(getProjectTasks(project.id, tasks));
    return status === "andamento" || status === "sem_tarefas";
  }).length;
  const completed = projects.filter(
    (project) => getProjectStatus(getProjectTasks(project.id, tasks)) === "concluido"
  ).length;

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
