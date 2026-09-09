import { Member } from "@rotaract/members";
import { isTaskOverdue, TaskPayload, type Task, TaskStatus } from "./tasks";

export type Projects = {
  id: string;
  title: string;
  description: string;
  managerId: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectsPayload = {
  id: string;
  title: string;
  description: string;
  managerId: string;
  members: string[];
};

export type Project = {
  id: string;
  title: string;
  description: string;
  managerId: string;
  members: string[];
  createdAt: string;
  updatedAt: string;
};

export type ProjectPayload = {
  title: string;
  description: string;
  managerId: string;
  members: string[];
};

export type ProjectFilter = "todos" | "andamento" | "concluidos" | "atrasados";

export type ProjectStatus = "sem_tarefas" | "andamento" | "concluido" | "atrasado";

export const PROJECT_FILTERS: { id: ProjectFilter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "andamento", label: "Em andamento" },
  { id: "concluidos", label: "Concluídos" },
  { id: "atrasados", label: "Atrasados" },
];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  sem_tarefas: "Sem tarefas",
  andamento: "Em andamento",
  concluido: "Concluído",
  atrasado: "Atrasado",
};

export const PROJECT_STATUS_STYLES: Record<ProjectStatus, string> = {
  sem_tarefas: "bg-zinc-100 text-zinc-600",
  andamento: "bg-rotaract-pink/10 text-rotaract-pink",
  concluido: "bg-emerald-50 text-emerald-700",
  atrasado: "bg-rose-50 text-rose-700",
};

export const PROJECT_INPUT_CLASS =
  "h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-900 outline-none ring-rotaract-pink/20 transition placeholder:text-zinc-400 focus:border-rotaract-pink/50 focus:bg-white focus:ring-4";

export const PROJECT_TEXTAREA_CLASS =
  "min-h-[6rem] w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none ring-rotaract-pink/20 transition placeholder:text-zinc-400 focus:border-rotaract-pink/50 focus:bg-white focus:ring-4";

export function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function uniqueIds(ids: string[]): string[] {
  return Array.from(new Set(ids.filter(Boolean)));
}

export function getProjectTasks(projectId: string, tasks: Task[]): Task[] {
  return tasks.filter((task) => task.projectId === projectId);
}

export function getProjectStatus(tasks: Task[]): ProjectStatus {
  if (tasks.some((task) => isTaskOverdue(task))) return "atrasado";

  const actionable = tasks.filter((task) => task.status !== "cancelled");
  if (actionable.length === 0) return "sem_tarefas";
  if (actionable.every((task) => task.status === "completed")) return "concluido";
  return "andamento";
}

export function getProjectProgress(tasks: Task[]): {
  total: number;
  completed: number;
  percent: number;
} {
  const actionable = tasks.filter((task) => task.status !== "cancelled");
  const completed = actionable.filter((task) => task.status === "completed").length;
  return {
    total: actionable.length,
    completed,
    percent:
      actionable.length === 0
        ? 0
        : Math.round((completed / actionable.length) * 100),
  };
}

export function matchesProjectFilter(
  status: ProjectStatus,
  filter: ProjectFilter
): boolean {
  if (filter === "todos") return true;
  if (filter === "andamento") return status === "andamento" || status === "sem_tarefas";
  if (filter === "concluidos") return status === "concluido";
  return status === "atrasado";
}

export type ProjectDetailProps = {
  project: Project;
  tasks: Task[];
  members: Member[];
  onUpdateProject: (payload: ProjectPayload) => void | Promise<void>;
  onRemoveProject: () => void;
  onCreateTask: (payload: TaskPayload) => void | Promise<void>;
  onUpdateTask: (taskId: string, payload: TaskPayload) => void | Promise<void>;
  onChangeTaskStatus: (taskId: string, status: TaskStatus) => void | Promise<void>;
  onRemoveTask: (taskId: string) => void | Promise<void>;
};

export type ProjectsPageProps = {
  userName: string;
  currentUserId?: string;
  backHref?: string;
};