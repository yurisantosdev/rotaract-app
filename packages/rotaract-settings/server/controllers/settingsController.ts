import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Setting } from "../models/Settings";
import type { AuthenticatedRequest } from "../types/express";
import {
  type SettingResponse,
  type SettingTypeDoc,
} from "../types/Setting";

function serializar(doc: SettingTypeDoc): SettingResponse {
  return {
    id: doc._id.toString(),
    valueContribution: doc.valueContribution,
    logo: doc.logo,
    nameClub: doc.nameClub,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}


type SettingInput = {
  valueContribution: number;
  logo: string;
  nameClub: string;
};

function parseSettingBody(
  body: unknown
): { ok: true; data: SettingInput } | { ok: false; erro: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, erro: "Corpo da requisição inválido" };
  }

  const { valueContribution, logo, nameClub } = body as {
    valueContribution?: unknown;
    logo?: unknown;
    nameClub?: unknown;
  };

  if (typeof valueContribution !== "number" || valueContribution <= 0) {
    return { ok: false, erro: "Campo mensalidade é obrigatório e deve ser um número maior que zero" };
  }

  if (typeof logo !== "string" || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=\s]+$/.test(logo.trim())) {
    return { ok: false, erro: "Campo logomarca deve ser uma imagem PNG, JPG ou WEBP em base64" };
  }

  if (typeof nameClub !== "string" || !nameClub.trim()) {
    return { ok: false, erro: "Campo nome do clube é obrigatório" };
  }

  return {
    ok: true,
    data: {
      valueContribution,
      logo: logo.trim(),
      nameClub: nameClub.trim(),
    },
  };
}

export async function list(_req: Request, res: Response): Promise<void> {
  const itens = await Setting.find().sort({ createdAt: -1 }).lean();
  res.json(itens.map((item) => serializar(item as unknown as SettingTypeDoc)));
}

export async function create(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.sub;
  if (!userId || !mongoose.isValidObjectId(userId)) {
    res.status(401).json({ erro: "Token de autenticação necessário" });
    return;
  }

  const parsed = parseSettingBody(req.body);
  if (!parsed.ok) {
    res.status(400).json({ erro: parsed.erro });
    return;
  }

  const criada = await Setting.create({
    ...parsed.data,
    createdBy: new mongoose.Types.ObjectId(userId),
  });

  res.status(201).json(serializar(criada.toObject() as SettingTypeDoc));
}

export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ erro: "ID inválido" });
    return;
  }

  const parsed = parseSettingBody(req.body);
  if (!parsed.ok) {
    res.status(400).json({ erro: parsed.erro });
    return;
  }

  const atualizada = await Setting.findByIdAndUpdate(id, parsed.data, {
    new: true,
    runValidators: true,
  }).lean();

  if (!atualizada) {
    res.status(404).json({ erro: "Configuração não encontrada" });
    return;
  }

  res.json(serializar(atualizada as unknown as SettingTypeDoc));
}
