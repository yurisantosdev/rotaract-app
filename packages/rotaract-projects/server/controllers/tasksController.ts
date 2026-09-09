import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Projects } from "../models/Projects";
import { Tasks } from "../models/Tasks";
import type { AuthenticatedRequest } from "../types/express";
import {
  type TasksResponse,
  type TasksTypeDoc,
} from "../types/Tasks";
import { TASK_STATUS } from "../types/Tasks";
import { TaskStatus } from "../types/Tasks";
import { createNotice } from "@rotaract/notices/server";

function asIdString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toString" in value) {
    return String(value);
  }
  return "";
}

async function notifyMember(
  memberId: string | undefined,
  title: string,
  message: string
): Promise<void> {
  if (!memberId || !mongoose.isValidObjectId(memberId)) {
    return;
  }
  await createNotice(memberId, title, message);
}

async function projectTitleById(projectId: string | undefined): Promise<string> {
  if (!projectId || !mongoose.isValidObjectId(projectId)) {
    return "";
  }

  const project = await Projects.findById(projectId).select("title").lean();
  return asIdString(project?.title).trim();
}

function tarefaNoProjeto(taskTitle: string, projectTitle: string): string {
  const projeto = projectTitle ? ` do projeto "${projectTitle}"` : "";
  return `"${taskTitle}"${projeto}`;
}

function toDateInput(value: unknown): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const date = value instanceof Date ? value : new Date(String(value ?? ""));
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function serializar(doc: TasksTypeDoc): TasksResponse {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    managerId: asIdString(doc.managerId),
    projectId: asIdString(doc.projectId),
    date: toDateInput(doc.date),
    status: doc.status,
    limit: toDateInput(doc.limit),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

type TasksInput = {
  title: string;
  description: string;
  managerId: string;
  projectId: string;
  date: string;
  status: TaskStatus;
  limit: string;
};

function isValidDateString(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
}

function parseTasksBody(
  body: unknown
): { ok: true; data: TasksInput } | { ok: false; erro: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, erro: "Corpo da requisição inválido" };
  }

  const { title, description, managerId, projectId, date, status, limit } = body as {
    title?: unknown;
    description?: unknown;
    managerId?: unknown;
    projectId?: unknown;
    date?: unknown;
    status?: unknown;
    limit?: unknown;
  };

  if (typeof title !== "string" || !title.trim()) {
    return { ok: false, erro: "Campo título é obrigatório e deve ser uma string" };
  }

  if (typeof description !== "string" || !description.trim()) {
    return { ok: false, erro: "Campo descrição é obrigatório e deve ser uma string" };
  }

  if (typeof managerId !== "string" || !mongoose.isValidObjectId(managerId)) {
    return { ok: false, erro: "Campo ID do gerente é obrigatório e deve ser um ID válido" };
  }

  if (typeof projectId !== "string" || !mongoose.isValidObjectId(projectId)) {
    return { ok: false, erro: "Campo ID do projeto é obrigatório e deve ser um ID válido" };
  }

  if (!isValidDateString(date)) {
    return { ok: false, erro: "Campo data é obrigatório e deve ser uma data válida" };
  }

  if (typeof status !== "string" || !TASK_STATUS.includes(status as TaskStatus)) {
    return { ok: false, erro: "Campo status é obrigatório e deve ser um status válido" };
  }

  if (!isValidDateString(limit)) {
    return { ok: false, erro: "Campo limite é obrigatório e deve ser uma data válida" };
  }
  return {
    ok: true,
    data: {
      title: title.trim(),
      description: description.trim(),
      managerId: managerId.trim(),
      projectId: projectId.trim(),
      date: date.trim(),
      status: status as TaskStatus,
      limit: limit.trim(),
    },
  };
}

export async function list(_req: Request, res: Response): Promise<void> {
  const itens = await Tasks.find().sort({ createdAt: -1 }).lean();
  res.json(itens.map((item) => serializar(item as unknown as TasksTypeDoc)));
}

export async function create(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.sub;
  if (!userId || !mongoose.isValidObjectId(userId)) {
    res.status(401).json({ erro: "Token de autenticação necessário" });
    return;
  }

  const parsed = parseTasksBody(req.body);
  if (!parsed.ok) {
    res.status(400).json({ erro: parsed.erro });
    return;
  }

  const criada = await Tasks.create({
    ...parsed.data,
    createdBy: new mongoose.Types.ObjectId(userId),
  });

  const projectTitle = await projectTitleById(parsed.data.projectId);
  await notifyMember(
    parsed.data.managerId,
    "Você recebeu uma tarefa",
    `Você é o responsável pela tarefa ${tarefaNoProjeto(parsed.data.title, projectTitle)}.`
  );

  res.status(201).json(serializar(criada.toObject() as TasksTypeDoc));
}

export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ erro: "ID inválido" });
    return;
  }

  const parsed = parseTasksBody(req.body);
  if (!parsed.ok) {
    res.status(400).json({ erro: parsed.erro });
    return;
  }

  const anterior = await Tasks.findById(id).lean();
  if (!anterior) {
    res.status(404).json({ erro: "Tarefa não encontrada" });
    return;
  }

  const atualizada = await Tasks.findByIdAndUpdate(id, parsed.data, {
    new: true,
    runValidators: true,
  }).lean();

  if (!atualizada) {
    res.status(404).json({ erro: "Tarefa não encontrada" });
    return;
  }

  const managerAnterior = asIdString(anterior.managerId);
  const managerAtual = parsed.data.managerId;
  const projectTitle = await projectTitleById(parsed.data.projectId);
  const tarefa = tarefaNoProjeto(parsed.data.title, projectTitle);

  if (managerAnterior !== managerAtual) {
    await Promise.all([
      notifyMember(
        managerAtual,
        "Você recebeu uma tarefa",
        `Você é o responsável pela tarefa ${tarefa}.`
      ),
      notifyMember(
        managerAnterior,
        "Uma tarefa foi reatribuída",
        `Você não é mais responsável pela tarefa ${tarefa}.`
      ),
    ]);
  } else {
    await notifyMember(
      managerAtual,
      "Uma tarefa foi atualizada",
      `A tarefa ${tarefa} foi atualizada.`
    );
  }

  res.json(serializar(atualizada as unknown as TasksTypeDoc));
}

export async function remove(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ erro: "ID inválido" });
    return;
  }

  const removida = await Tasks.findByIdAndDelete(id).lean();
  if (!removida) {
    res.status(404).json({ erro: "Tarefa não encontrada" });
    return;
  }

  const projectTitle = await projectTitleById(asIdString(removida.projectId));
  await notifyMember(
    asIdString(removida.managerId),
    "Uma tarefa foi removida",
    `A tarefa ${tarefaNoProjeto(asIdString(removida.title), projectTitle)} foi removida.`
  );

  res.status(204).send();
}