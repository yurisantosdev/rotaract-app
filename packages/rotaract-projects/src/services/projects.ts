import { uniqueIds, type Project, type ProjectPayload } from "../types/projects";
import {
  TASK_STATUS,
  type Task,
  type TaskStatus,
  type TaskWritePayload,
} from "../types/tasks";

const PROJECTS_URL = "/api/projects";

function asId(value: unknown): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (value && typeof value === "object") {
    if ("$oid" in value && typeof (value as { $oid: unknown }).$oid === "string") {
      return (value as { $oid: string }).$oid;
    }
    if ("toString" in value && typeof value.toString === "function") {
      const text = value.toString();
      if (text && text !== "[object Object]") return text;
    }
  }
  return "";
}

function asDateString(value: unknown): string {
  if (typeof value === "string" && value) return value;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  return "";
}

function parseProject(data: unknown): Project {
  if (!data || typeof data !== "object") {
    throw new Error("Resposta inválida da API de projetos");
  }

  const row = data as Record<string, unknown>;
  const id = asId(row.id) || asId(row._id);
  const title = typeof row.title === "string" ? row.title : "";

  if (!id || !title) {
    throw new Error("Resposta inválida da API de projetos");
  }

  return {
    id,
    title,
    description: typeof row.description === "string" ? row.description : "",
    managerId: asId(row.managerId),
    members: Array.isArray(row.members)
      ? row.members.map(asId).filter(Boolean)
      : [],
    createdAt: asDateString(row.createdAt),
    updatedAt: asDateString(row.updatedAt),
  };
}

async function readApiError(response: Response, fallback: string): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (
      body &&
      typeof body === "object" &&
      "erro" in body &&
      typeof (body as { erro: unknown }).erro === "string"
    ) {
      return (body as { erro: string }).erro;
    }
  } catch {
    // keep fallback
  }

  return fallback;
}

function toApiBody(project: ProjectPayload) {
  return {
    title: project.title,
    description: project.description,
    managerId: project.managerId,
    members: uniqueIds([project.managerId, ...project.members]),
  };
}

export async function listProjects(signal: AbortSignal): Promise<Project[]> {
  const response = await fetch(PROJECTS_URL, {
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar os projetos");
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Resposta inválida da API de projetos");
  }

  return data.flatMap((item) => {
    try {
      return [parseProject(item)];
    } catch {
      return [];
    }
  });
}

export async function createProjects(
  signal: AbortSignal,
  project: ProjectPayload
): Promise<Project> {
  const response = await fetch(PROJECTS_URL, {
    method: "POST",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toApiBody(project)),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Não foi possível salvar o projeto"));
  }

  return parseProject(await response.json());
}

export async function updateProjects(
  id: string,
  signal: AbortSignal,
  project: ProjectPayload
): Promise<Project> {
  const response = await fetch(`${PROJECTS_URL}/${id}`, {
    method: "PUT",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toApiBody(project)),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Não foi possível atualizar o projeto"));
  }

  return parseProject(await response.json());
}

export async function removeProjects(
  id: string,
  signal: AbortSignal,
): Promise<string> {
  const response = await fetch(`${PROJECTS_URL}/${id}`, {
    method: "DELETE",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Não foi possível excluir o projeto"));
  }

  return "Projeto excluído com sucesso";
}

function asDateInput(value: unknown): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const parsed = asDateString(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(parsed)) return parsed.slice(0, 10);
  return parsed;
}

function asTaskStatus(value: unknown): TaskStatus {
  if (typeof value === "string" && TASK_STATUS.includes(value as TaskStatus)) {
    return value as TaskStatus;
  }
  return "new";
}

function parseTask(data: unknown): Task {
  if (!data || typeof data !== "object") {
    throw new Error("Resposta inválida da API de tarefas");
  }

  const row = data as Record<string, unknown>;
  const id = asId(row.id) || asId(row._id);
  const title = typeof row.title === "string" ? row.title : "";
  const projectId = asId(row.projectId);

  if (!id || !title || !projectId) {
    throw new Error("Resposta inválida da API de tarefas");
  }

  return {
    id,
    title,
    description: typeof row.description === "string" ? row.description : "",
    managerId: asId(row.managerId),
    projectId,
    date: asDateInput(row.date),
    status: asTaskStatus(row.status),
    limit: asDateInput(row.limit),
    createdAt: asDateString(row.createdAt),
    updatedAt: asDateString(row.updatedAt),
  };
}

function toTaskApiBody(task: TaskWritePayload) {
  return {
    title: task.title,
    description: task.description,
    managerId: task.managerId,
    projectId: task.projectId,
    date: task.date,
    status: task.status,
    limit: task.limit,
  };
}

const TASKS_URL = "/api/tasks";

export async function listTasks(signal: AbortSignal): Promise<Task[]> {
  const response = await fetch(TASKS_URL, {
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar as tarefas");
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Resposta inválida da API de tarefas");
  }

  return data.flatMap((item) => {
    try {
      return [parseTask(item)];
    } catch {
      return [];
    }
  });
}

export async function createTasks(
  signal: AbortSignal,
  task: TaskWritePayload
): Promise<Task> {
  const response = await fetch(TASKS_URL, {
    method: "POST",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toTaskApiBody(task)),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Não foi possível salvar a tarefa"));
  }

  return parseTask(await response.json());
}

export async function updateTasks(
  id: string,
  signal: AbortSignal,
  task: TaskWritePayload
): Promise<Task> {
  const response = await fetch(`${TASKS_URL}/${id}`, {
    method: "PUT",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toTaskApiBody(task)),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Não foi possível atualizar a tarefa"));
  }

  return parseTask(await response.json());
}

export async function removeTasks(
  id: string,
  signal: AbortSignal
): Promise<void> {
  const response = await fetch(`${TASKS_URL}/${id}`, {
    method: "DELETE",
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Não foi possível excluir a tarefa"));
  }
}
