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
    currentManagement: doc.currentManagement,
    managements: doc.managements,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

type SettingInput = {
  valueContribution: number;
  logo: string;
  nameClub: string;
  currentManagement: string;
  managements: string[];
};

function parseSettingBody(
  body: unknown
): { ok: true; data: SettingInput } | { ok: false; erro: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, erro: "Corpo da requisição inválido" };
  }

  const { valueContribution, logo, nameClub, currentManagement, managements } = body as {
    valueContribution?: unknown;
    logo?: unknown;
    nameClub?: unknown;
    currentManagement?: unknown;
    managements?: unknown;
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

  if (typeof currentManagement !== "string" || !currentManagement.trim()) {
    return { ok: false, erro: "Campo gestão atual é obrigatório e deve ser uma string" };
  }

  if (!Array.isArray(managements) || !managements.every((management) => typeof management === "string" && management.trim())) {
    return { ok: false, erro: "Campo gestões é obrigatório e deve ser um array de strings" };
  }

  return {
    ok: true,
    data: {
      valueContribution,
      logo: logo.trim(),
      nameClub: nameClub.trim(),
      currentManagement: currentManagement.trim(),
      managements: managements.map((management) => management.trim()),
    },
  };
}

function withCurrentInManagements(data: SettingInput): SettingInput {
  const current = data.currentManagement.trim();
  const already = data.managements.some(
    (item) => item.toLowerCase() === current.toLowerCase()
  );

  return {
    ...data,
    managements: already ? data.managements : [...data.managements, current],
  };
}

async function addManagementToActiveMembers(management: string): Promise<void> {
  const name = management.trim();
  if (!name) return;

  await mongoose.connection.collection("members").updateMany(
    { status: "ativo" },
    { $addToSet: { managements: name } }
  );
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

  const data = withCurrentInManagements(parsed.data);
  const criada = await Setting.create({
    ...data,
    createdBy: new mongoose.Types.ObjectId(userId),
  });

  await addManagementToActiveMembers(data.currentManagement);

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

  const existing = await Setting.findById(id).lean();
  if (!existing) {
    res.status(404).json({ erro: "Configuração não encontrada" });
    return;
  }

  const data = withCurrentInManagements(parsed.data);
  const previousCurrent =
    typeof existing.currentManagement === "string"
      ? existing.currentManagement.trim()
      : "";

  const atualizada = await Setting.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();

  if (!atualizada) {
    res.status(404).json({ erro: "Configuração não encontrada" });
    return;
  }

  if (data.currentManagement !== previousCurrent) {
    await addManagementToActiveMembers(data.currentManagement);
  }

  res.json(serializar(atualizada as unknown as SettingTypeDoc));
}

export function uniqueManagementNames(values: unknown): string[] | null {
  if (!Array.isArray(values)) return null;

  const names: string[] = [];
  const seen = new Set<string>();

  for (const item of values) {
    if (typeof item !== "string" || !item.trim()) return null;
    const name = item.trim();
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }

  return names;
}

export async function clubManagementsFromSettings(): Promise<{
  currentManagement: string;
  managements: string[];
}> {
  const settings = await mongoose.connection
    .collection("settings")
    .findOne(
      {},
      {
        sort: { createdAt: -1 },
        projection: { currentManagement: 1, managements: 1 },
      }
    );

  const currentManagement =
    typeof settings?.currentManagement === "string"
      ? settings.currentManagement.trim()
      : "";
  const managements = uniqueManagementNames(settings?.managements) ?? [];

  if (
    currentManagement &&
    !managements.some(
      (item) => item.toLowerCase() === currentManagement.toLowerCase()
    )
  ) {
    managements.push(currentManagement);
  }

  return { currentManagement, managements };
}