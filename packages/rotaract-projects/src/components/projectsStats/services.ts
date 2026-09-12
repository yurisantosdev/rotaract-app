"use client";

import { getProjectStatus, getProjectTasks } from "../../../src/types/projects";
import { ProjectsStatsProps } from "./type";

export function useProjectsPanel({
  projects,
  tasks
}: ProjectsStatsProps) {
  const inProgress = projects.filter((project) => {
    const status = getProjectStatus(getProjectTasks(project.id, tasks));
    return status === "andamento" || status === "sem_tarefas";
  }).length;
  const completed = projects.filter(
    (project) => getProjectStatus(getProjectTasks(project.id, tasks)) === "concluido"
  ).length;

  return {
    inProgress,
    completed
  };
}
