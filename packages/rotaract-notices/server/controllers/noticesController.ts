import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Notices } from "../models/Notices";
import type { AuthenticatedRequest } from "../types/express";
import {
  type NoticesResponse,
  type NoticesTypeDoc,
} from "../types/Notices";

function serializar(doc: NoticesTypeDoc): NoticesResponse {
  return {
    id: doc._id.toString(),
    title: doc.title,
    message: doc.message,
    memberId: doc.memberId.toString(),
    read: doc.read,
    date: doc.date,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

type NoticesInput = {
  title: string;
  message: string;
  memberId: string;
  read: boolean;
  date: string;
};

function parseNoticesBody(
  body: unknown
): { ok: true; data: NoticesInput } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Corpo da requisição inválido" };
  }

  const { title, message, memberId, read, date } = body as {
    title?: unknown;
    message?: unknown;
    memberId?: unknown;
    read?: unknown;
    date?: unknown;
  };

  if (typeof title !== "string" || !title.trim()) {
    return { ok: false, error: "Campo título é obrigatório" };
  }

  if (typeof message !== "string" || !message.trim()) {
    return { ok: false, error: "Campo mensagem é obrigatório" };
  }

  if (typeof memberId !== "string" || !mongoose.isValidObjectId(memberId)) {
    return { ok: false, error: "Campo ID do membro é obrigatório e deve ser um ID válido" };
  }

  if (typeof read !== "boolean") {
    return { ok: false, error: "Campo leitura é obrigatório e deve ser um booleano" };
  }

  if (typeof date !== "string" || !date.trim()) {
    return { ok: false, error: "Campo data é obrigatório" };
  }

  return {
    ok: true,
    data: {
      title,
      message,
      memberId,
      read,
      date,
    },
  };
}

export async function list(_req: Request, res: Response): Promise<void> {
  const itens = await Notices.find().sort({ createdAt: -1 }).lean();
  res.json(itens.map((item) => serializar(item as unknown as NoticesTypeDoc)));
}

export async function create(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.sub;
  if (!userId || !mongoose.isValidObjectId(userId)) {
    res.status(401).json({ error: "Token de autenticação necessário" });
    return;
  }

  const parsed = parseNoticesBody(req.body);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const criada = await Notices.create({
    ...parsed.data,
    memberId: new mongoose.Types.ObjectId(parsed.data.memberId),
  });

  res.status(201).json(serializar(criada.toObject() as NoticesTypeDoc));
}

export async function readAll(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }

  const atualizada = await Notices.findByIdAndUpdate(id, { read: true }, {
    new: true,
    runValidators: true,
  }).lean();

  if (!atualizada) {
    res.status(404).json({ error: "Notificação não encontrada" });
    return;
  }

  res.json(serializar(atualizada as unknown as NoticesTypeDoc));
}

export async function remove(req: Request, res: Response): Promise<void> {
  const id = typeof req.params.id === "string" ? req.params.id : undefined;
  if (!id || !mongoose.isValidObjectId(id)) {
    res.status(400).json({ erro: "ID inválido" });
    return;
  }

  const removida = await Notices.findByIdAndDelete(id).lean();
  if (!removida) {
    res.status(404).json({ error: "Notificação não encontrada" });
    return;
  }

  res.status(204).send();
}
