export const TASK_STATUS = [
  "new",
  "pending",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export type TaskFilter = "todas" | "abertas" | "concluidas" | "atrasadas";

export const TASK_FILTERS: { id: TaskFilter; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "abertas", label: "Abertas" },
  { id: "concluidas", label: "Concluídas" },
  { id: "atrasadas", label: "Atrasadas" },
];

export type TaskStatus = (typeof TASK_STATUS)[number];

export type Task = {
  id: string;
  title: string;
  description: string;
  managerId: string;
  projectId: string;
  date: string;
  status: TaskStatus;
  limit: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskPayload = {
  title: string;
  description: string;
  managerId: string;
  date: string;
  status: TaskStatus;
  limit: string;
};

export type TaskWritePayload = TaskPayload & {
  projectId: string;
};

export const TASK_STATUS_OPTIONS: { id: TaskStatus; label: string }[] = [
  { id: "new", label: "Nova" },
  { id: "pending", label: "Pendente" },
  { id: "in_progress", label: "Em andamento" },
  { id: "completed", label: "Concluída" },
  { id: "cancelled", label: "Cancelada" },
];

export const TASK_STATUS_STYLES: Record<
  TaskStatus,
  { chip: string; selected: string }
> = {
  new: {
    chip: "bg-white text-zinc-400 ring-zinc-200",
    selected: "bg-zinc-800 text-white ring-2 ring-zinc-900 shadow-sm",
  },
  pending: {
    chip: "bg-white text-amber-500 ring-amber-200",
    selected: "bg-amber-500 text-white ring-2 ring-amber-600 shadow-sm",
  },
  in_progress: {
    chip: "bg-white text-rotaract-pink ring-rotaract-pink/20",
    selected: "bg-rotaract-pink text-white ring-2 ring-rotaract-magenta shadow-sm",
  },
  completed: {
    chip: "bg-white text-emerald-500 ring-emerald-200",
    selected: "bg-emerald-500 text-white ring-2 ring-emerald-600 shadow-sm",
  },
  cancelled: {
    chip: "bg-white text-rose-400 ring-rose-200",
    selected: "bg-rose-500 text-white ring-2 ring-rose-600 shadow-sm",
  },
};

export function taskStatusLabel(status: TaskStatus): string {
  return TASK_STATUS_OPTIONS.find((item) => item.id === status)?.label ?? status;
}

export function isClosedTask(status: TaskStatus): boolean {
  return status === "completed" || status === "cancelled";
}

export function isTaskOverdue(task: Task, now = new Date()): boolean {
  if (isClosedTask(task.status)) return false;
  const limit = new Date(`${task.limit}T23:59:59`);
  if (Number.isNaN(limit.getTime())) return false;
  return limit.getTime() < now.getTime();
}
