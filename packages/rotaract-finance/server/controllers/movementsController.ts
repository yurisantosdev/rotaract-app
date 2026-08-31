import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Movement } from "../models/Movement";
import type { AuthenticatedRequest } from "../types/express";
import {
  MOVEMENT_CATEGORIES,
  MOVEMENT_TYPES,
  type MovementCategory,
  type MovementResponse,
  type MovementType,
  type MovementTypeDoc,
} from "../types/Movement";

const DATE_ISO = /^\d{4}-\d{2}-\d{2}$/;

function serializar(doc: MovementTypeDoc): MovementResponse {
  return {
    id: doc._id.toString(),
    date: doc.date,
    description: doc.description,
    category: doc.category,
    type: doc.type,
    value: doc.value,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function isMovementCategory(value: string): value is MovementCategory {
  return (MOVEMENT_CATEGORIES as readonly string[]).includes(value);
}

function isMovementType(value: string): value is MovementType {
  return (MOVEMENT_TYPES as readonly string[]).includes(value);
}

function isValidIsoDate(value: string): boolean {
  if (!DATE_ISO.test(value)) return false;
  const parts = value.split("-").map(Number);
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  if (year === undefined || month === undefined || day === undefined) {
    return false;
  }
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

type MovementInput = {
  date: string;
  description: string;
  category: MovementCategory;
  type: MovementType;
  value: number;
};

function parseMovementBody(
  body: unknown
): { ok: true; data: MovementInput } | { ok: false; erro: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, erro: "Corpo da requisição inválido" };
  }

  const { date, description, category, type, value } = body as {
    date?: unknown;
    description?: unknown;
    category?: unknown;
    type?: unknown;
    value?: unknown;
  };

  if (typeof date !== "string" || !isValidIsoDate(date.trim())) {
    return { ok: false, erro: "Campo date é obrigatório e deve ser YYYY-MM-DD" };
  }

  if (typeof description !== "string" || !description.trim()) {
    return { ok: false, erro: "Campo description é obrigatório" };
  }

  if (typeof category !== "string" || !isMovementCategory(category)) {
    return {
      ok: false,
      erro: `Campo category deve ser um de: ${MOVEMENT_CATEGORIES.join(", ")}`,
    };
  }

  if (typeof type !== "string" || !isMovementType(type)) {
    return { ok: false, erro: "Campo type deve ser entrada ou saida" };
  }

  const parsedValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return { ok: false, erro: "Campo value deve ser um número maior que zero" };
  }

  return {
    ok: true,
    data: {
      date: date.trim(),
      description: description.trim(),
      category,
      type,
      value: parsedValue,
    },
  };
}

export async function list(_req: Request, res: Response): Promise<void> {
  const itens = await Movement.find().sort({ date: -1, createdAt: -1 }).lean();
  res.json(itens.map((item) => serializar(item as unknown as MovementTypeDoc)));
}

export async function create(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.sub;
  if (!userId || !mongoose.isValidObjectId(userId)) {
    res.status(401).json({ erro: "Token de autenticação necessário" });
    return;
  }

  const parsed = parseMovementBody(req.body);
  if (!parsed.ok) {
    res.status(400).json({ erro: parsed.erro });
    return;
  }

  const criada = await Movement.create({
    ...parsed.data,
    createdBy: new mongoose.Types.ObjectId(userId),
  });

  res.status(201).json(serializar(criada.toObject() as MovementTypeDoc));
}

export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ erro: "ID inválido" });
    return;
  }

  const parsed = parseMovementBody(req.body);
  if (!parsed.ok) {
    res.status(400).json({ erro: parsed.erro });
    return;
  }

  const atualizada = await Movement.findByIdAndUpdate(id, parsed.data, {
    new: true,
    runValidators: true,
  }).lean();

  if (!atualizada) {
    res.status(404).json({ erro: "Movimentação não encontrada" });
    return;
  }

  res.json(serializar(atualizada as unknown as MovementTypeDoc));
}

export async function remove(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ erro: "ID inválido" });
    return;
  }

  const removida = await Movement.findByIdAndDelete(id).lean();
  if (!removida) {
    res.status(404).json({ erro: "Movimentação não encontrada" });
    return;
  }

  res.status(204).send();
}
