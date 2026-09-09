import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Projects } from "../models/Projects";
import type { AuthenticatedRequest } from "../types/express";
import {
  type ProjectsResponse,
  type ProjectsTypeDoc,
} from "../types/Projects";
import { createNotice } from "@rotaract/notices/server";

function asIdString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toString" in value) {
    return String(value);
  }
  return "";
}

function memberIdsFromProject(project: {
  managerId?: unknown;
  members?: unknown[];
}): string[] {
  return Array.from(
    new Set(
      [asIdString(project.managerId), ...(project.members ?? []).map(asIdString)].filter(Boolean)
    )
  );
}

async function notifyMembers(
  memberIds: string[],
  title: string,
  message: string
): Promise<void> {
  const unique = Array.from(
    new Set(memberIds.filter((id) => mongoose.isValidObjectId(id)))
  );
  await Promise.all(unique.map((memberId) => createNotice(memberId, title, message)));
}

function serializar(doc: ProjectsTypeDoc): ProjectsResponse {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    managerId: asIdString(doc.managerId),
    members: (doc.members ?? []).map(asIdString),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

type ProjectsInput = {
  title: string;
  description: string;
  managerId: string;
  members: string[];
};

function parseProjectsBody(
  body: unknown
): { ok: true; data: ProjectsInput } | { ok: false; erro: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, erro: "Corpo da requisição inválido" };
  }

  const { title, description, managerId, members } = body as {
    title?: unknown;
    description?: unknown;
    managerId?: unknown;
    members?: unknown;
  };

  if (typeof title !== "string" || !title.trim()) {
    return { ok: false, erro: "Campo mensalidade é obrigatório e deve ser um número maior que zero" };
  }

  if (typeof description !== "string" || !description.trim()) {
    return { ok: false, erro: "Campo descrição é obrigatório" };
  }

  if (typeof managerId !== "string" || !mongoose.isValidObjectId(managerId)) {
    return { ok: false, erro: "Campo ID do gerente é obrigatório e deve ser um ID válido" };
  }

  if (!Array.isArray(members) || !members.every((member) => typeof member === "string" && mongoose.isValidObjectId(member))) {
    return { ok: false, erro: "Campo membros é obrigatório e deve ser um array de IDs válidos" };
  }

  return {
    ok: true,
    data: {
      title: title.trim(),
      description: description.trim(),
      managerId: managerId.trim(),
      members: members.map((member) => member.trim()),
    },
  };
}

export async function list(_req: Request, res: Response): Promise<void> {
  const itens = await Projects.find().sort({ createdAt: -1 }).lean();
  res.json(itens.map((item) => serializar(item as unknown as ProjectsTypeDoc)));
}

export async function create(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.sub;
  if (!userId || !mongoose.isValidObjectId(userId)) {
    res.status(401).json({ erro: "Token de autenticação necessário" });
    return;
  }

  const parsed = parseProjectsBody(req.body);
  if (!parsed.ok) {
    res.status(400).json({ erro: parsed.erro });
    return;
  }

  const criada = await Projects.create({
    ...parsed.data,
    createdBy: new mongoose.Types.ObjectId(userId),
  });

  await notifyMembers(
    [parsed.data.managerId, ...parsed.data.members],
    "Você foi incluído em um projeto",
    `Você foi adicionado ao projeto "${parsed.data.title}".`
  );

  res.status(201).json(serializar(criada.toObject() as ProjectsTypeDoc));
}

export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ erro: "ID inválido" });
    return;
  }

  const parsed = parseProjectsBody(req.body);
  if (!parsed.ok) {
    res.status(400).json({ erro: parsed.erro });
    return;
  }

  const anterior = await Projects.findById(id).lean();
  if (!anterior) {
    res.status(404).json({ erro: "Projeto não encontrado" });
    return;
  }

  const atualizada = await Projects.findByIdAndUpdate(id, parsed.data, {
    new: true,
    runValidators: true,
  }).lean();

  if (!atualizada) {
    res.status(404).json({ erro: "Projeto não encontrado" });
    return;
  }

  const idsAnteriores = new Set(memberIdsFromProject(anterior));
  const idsAtuaisList = [parsed.data.managerId, ...parsed.data.members];
  const idsAtuais = new Set(idsAtuaisList);
  const incluidos = idsAtuaisList.filter((memberId) => !idsAnteriores.has(memberId));
  const removidos = memberIdsFromProject(anterior).filter((memberId) => !idsAtuais.has(memberId));
  const mantidos = idsAtuaisList.filter((memberId) => idsAnteriores.has(memberId));

  await Promise.all([
    notifyMembers(
      incluidos,
      "Você foi incluído em um projeto",
      `Você foi adicionado ao projeto "${parsed.data.title}".`
    ),
    notifyMembers(
      removidos,
      "Você foi removido de um projeto",
      `Você foi removido do projeto "${asIdString(anterior.title) || parsed.data.title}".`
    ),
    notifyMembers(
      mantidos,
      "Um projeto foi atualizado",
      `O projeto "${parsed.data.title}" foi atualizado.`
    ),
  ]);

  res.json(serializar(atualizada as unknown as ProjectsTypeDoc));
}

export async function remove(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ erro: "ID inválido" });
    return;
  }

  const removida = await Projects.findByIdAndDelete(id).lean();
  if (!removida) {
    res.status(404).json({ erro: "Projeto não encontrado" });
    return;
  }

  await notifyMembers(
    memberIdsFromProject(removida),
    "Um projeto foi removido",
    `O projeto "${asIdString(removida.title)}" foi removido.`
  );

  res.status(204).send();
}