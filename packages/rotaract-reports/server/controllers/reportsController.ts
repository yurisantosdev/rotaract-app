import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Reports } from "../models/Reports";
import type { AuthenticatedRequest } from "../types/express";
import {
  REPORTS_STATUS_LABEL,
  ReportsStatus,
  type ReportsResponse,
  type ReportsStatus as ReportsStatusValue,
  type ReportsTypeDoc,
} from "../types/Reports";
import { createNotice } from "@rotaract/notices/server";
import { listDevelopers } from "@rotaract/members/server";

function serializar(doc: ReportsTypeDoc): ReportsResponse {
  return {
    id: doc._id.toString(),
    description: doc.description,
    status: doc.status,
    image: doc.image,
    date: doc.date,
    memberId: doc.memberId.toString(),
    returnFeedback: doc.returnFeedback,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

type ReportsInput = {
  description: string;
  image?: string;
};

type ReportsUpdateInput = {
  description: string;
  status: ReportsStatusValue;
  returnFeedback: string;
};

type NoticeMembersDevelopers = {
  title: string;
  message: string;
};

const REPORTS_STATUS_VALUES = Object.values(ReportsStatus);
const IMAGE_DATA_URL_PATTERN =
  /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=\s]+$/;

function formatBrasiliaDateTime(date = new Date()): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function parseReportsBody(
  body: unknown
): { ok: true; data: ReportsInput } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Corpo da requisição inválido" };
  }

  const { description, image } = body as {
    description?: unknown;
    image?: unknown;
  };

  if (typeof description !== "string" || !description.trim()) {
    return { ok: false, error: "Campo descrição é obrigatório" };
  }

  const data: ReportsInput = {
    description: description.trim(),
  };

  if (image !== undefined && image !== null && image !== "") {
    if (typeof image !== "string" || !IMAGE_DATA_URL_PATTERN.test(image)) {
      return {
        ok: false,
        error: "Imagem inválida. Envie um data URL base64 (png, jpeg ou webp).",
      };
    }
    data.image = image;
  }

  return { ok: true, data };
}

function parseReportsUpdateBody(
  body: unknown
): { ok: true; data: ReportsUpdateInput } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Corpo da requisição inválido" };
  }

  const { description, status, returnFeedback } = body as {
    description?: unknown;
    status?: unknown;
    returnFeedback?: unknown;
  };

  if (typeof description !== "string" || !description.trim()) {
    return { ok: false, error: "Campo descrição é obrigatório" };
  }

  if (
    typeof status !== "string" ||
    !REPORTS_STATUS_VALUES.includes(status as ReportsStatusValue)
  ) {
    return { ok: false, error: "Status inválido" };
  }

  if (typeof returnFeedback !== "string" || !returnFeedback.trim()) {
    return { ok: false, error: "Campo retorno do feedback é obrigatório" };
  }

  return {
    ok: true,
    data: {
      description: description.trim(),
      status: status as ReportsStatusValue,
      returnFeedback: returnFeedback.trim(),
    },
  };
}

async function noticeMembersDevelopers({
  title,
  message,
}: NoticeMembersDevelopers) {
  const members = await listDevelopers();

  await Promise.all(
    members.map((member) => createNotice(member.id, title, message))
  );
}

export async function list(req: AuthenticatedRequest, res: Response): Promise<void> {
  const itens = await Reports.find()
    .sort({ createdAt: -1 })
    .lean();
  res.json(itens.map((item) => serializar(item as unknown as ReportsTypeDoc)));
}

export async function create(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.sub;
  if (!userId || !mongoose.isValidObjectId(userId)) {
    res.status(401).json({ error: "Token de autenticação necessário" });
    return;
  }

  const parsed = parseReportsBody(req.body);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const criada = await Reports.create({
    ...parsed.data,
    memberId: new mongoose.Types.ObjectId(userId),
    date: formatBrasiliaDateTime(),
  });

  await noticeMembersDevelopers({
    title: "Novo report de bug",
    message: `Um novo report foi criado: ${parsed.data.description}.`,
  });

  res.status(201).json(serializar(criada.toObject() as ReportsTypeDoc));
}

export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ erro: "ID inválido" });
    return;
  }

  const parsed = parseReportsUpdateBody(req.body);
  if (!parsed.ok) {
    res.status(400).json({ erro: parsed.error });
    return;
  }

  const anterior = await Reports.findById(id).lean();
  if (!anterior) {
    res.status(404).json({ erro: "Feedback não encontrado" });
    return;
  }

  const atualizada = await Reports.findByIdAndUpdate(id, parsed.data, {
    new: true,
    runValidators: true,
  }).lean();

  if (!atualizada) {
    res.status(404).json({ erro: "Feedback não encontrado" });
    return;
  }

  const updatedAt = formatBrasiliaDateTime();
  const statusLabel = REPORTS_STATUS_LABEL[parsed.data.status];
  const memberId = (atualizada as unknown as ReportsTypeDoc).memberId.toString();

  await createNotice(
    memberId,
    "Feedback atualizado",
    [
      `Seu feedback foi atualizado em ${updatedAt}.`,
      `Novo status: ${statusLabel}.`,
      `Retorno: ${parsed.data.returnFeedback}`,
    ].join("\n")
  );

  res.json(serializar(atualizada as unknown as ReportsTypeDoc));
}

export async function remove(req: Request, res: Response): Promise<void> {
  const id = typeof req.params.id === "string" ? req.params.id : undefined;
  if (!id || !mongoose.isValidObjectId(id)) {
    res.status(400).json({ erro: "ID inválido" });
    return;
  }

  const removida = await Reports.findByIdAndDelete(id).lean();
  if (!removida) {
    res.status(404).json({ error: "Feedback não encontrado" });
    return;
  }

  res.status(204).send();
}
