import type { Request, Response } from "express";
import mongoose from "mongoose";
import { createNotice } from "@rotaract/notices/server";
import { clubManagementsFromSettings } from "@rotaract/settings/server";
import {
  mergeAcceptedIntoPresent,
  syncPautasWithAcceptedCalendarMembers,
} from "../lib/calendarSync";
import { Pautas } from "../models/Pautas";
import type { AuthenticatedRequest } from "../types/express";
import {
  PAUTA_ITEM_STATUS,
  PAUTA_STATUS,
  PAUTA_TYPES,
  type PautaItemResponse,
  type PautaItemStatus,
  type PautaItemTypeDoc,
  type PautaStatus,
  type PautaType,
  type PautasResponse,
  type PautasTypeDoc,
} from "../types/Pautas";

function asIdString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toString" in value) {
    return String(value);
  }
  return "";
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

function toIsoOrNull(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string" && value.trim()) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  return null;
}

function sortItems(items: PautaItemTypeDoc[]): PautaItemTypeDoc[] {
  return [...items].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "pt-BR"));
}

function serializeItem(item: PautaItemTypeDoc): PautaItemResponse {
  return {
    id: asIdString(item._id),
    title: item.title,
    description: item.description ?? "",
    responsibleId: asIdString(item.responsibleId),
    status: item.status,
    order: item.order,
    management: item.management ?? "",
  };
}

function serialize(doc: PautasTypeDoc): PautasResponse {
  return {
    id: doc._id.toString(),
    title: doc.title,
    meetingDate: toDateInput(doc.meetingDate),
    type: doc.type,
    status: doc.status,
    notes: doc.notes ?? "",
    presentMemberIds: (doc.presentMemberIds ?? []).map(asIdString).filter(Boolean),
    items: sortItems(doc.items ?? []).map(serializeItem),
    calendarEventId: asIdString(doc.calendarEventId) || null,
    generatedAt: toIsoOrNull(doc.generatedAt),
    management: doc.management,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
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

function isValidDateString(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) return false;
  return !Number.isNaN(new Date(`${value.trim()}T00:00:00`).getTime());
}

type PautaInput = {
  title: string;
  meetingDate: string;
  type: PautaType;
  status: PautaStatus;
  notes: string;
  presentMemberIds: string[];
  calendarEventId: string | null;
};

type ItemInput = {
  title: string;
  description: string;
  responsibleId: string;
  status: PautaItemStatus;
};

function parsePautaBody(
  body: unknown
): { ok: true; data: PautaInput } | { ok: false; erro: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, erro: "Corpo da requisição inválido" };
  }

  const {
    title,
    meetingDate,
    type,
    status,
    notes,
    presentMemberIds,
    calendarEventId,
  } = body as {
    title?: unknown;
    meetingDate?: unknown;
    type?: unknown;
    status?: unknown;
    notes?: unknown;
    presentMemberIds?: unknown;
    calendarEventId?: unknown;
  };

  if (typeof title !== "string" || title.trim().length < 3) {
    return {
      ok: false,
      erro: "Campo título é obrigatório e deve ter pelo menos 3 caracteres",
    };
  }

  if (!isValidDateString(meetingDate)) {
    return { ok: false, erro: "Campo data da reunião é obrigatório e deve ser uma data válida" };
  }

  if (typeof type !== "string" || !PAUTA_TYPES.includes(type as PautaType)) {
    return { ok: false, erro: "Campo tipo é obrigatório e deve ser um tipo válido" };
  }

  if (typeof status !== "string" || !PAUTA_STATUS.includes(status as PautaStatus)) {
    return { ok: false, erro: "Campo status é obrigatório e deve ser um status válido" };
  }

  if (notes !== undefined && typeof notes !== "string") {
    return { ok: false, erro: "Campo observações deve ser uma string" };
  }

  if (
    !Array.isArray(presentMemberIds) ||
    !presentMemberIds.every(
      (id) => typeof id === "string" && mongoose.isValidObjectId(id)
    )
  ) {
    return {
      ok: false,
      erro: "Campo membros presentes deve ser um array de IDs válidos",
    };
  }

  let parsedCalendarEventId: string | null = null;
  if (calendarEventId !== undefined && calendarEventId !== null && calendarEventId !== "") {
    if (
      typeof calendarEventId !== "string" ||
      !mongoose.isValidObjectId(calendarEventId)
    ) {
      return { ok: false, erro: "Campo reunião da agenda deve ser um ID válido" };
    }
    parsedCalendarEventId = calendarEventId.trim();
  }

  return {
    ok: true,
    data: {
      title: title.trim(),
      meetingDate: meetingDate.trim().slice(0, 10),
      type: type as PautaType,
      status: status as PautaStatus,
      notes: typeof notes === "string" ? notes.trim() : "",
      presentMemberIds: Array.from(
        new Set(presentMemberIds.map((id) => id.trim()).filter(Boolean))
      ),
      calendarEventId: parsedCalendarEventId,
    },
  };
}

function parseItemBody(
  body: unknown
): { ok: true; data: ItemInput } | { ok: false; erro: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, erro: "Corpo da requisição inválido" };
  }

  const { title, description, responsibleId, status } = body as {
    title?: unknown;
    description?: unknown;
    responsibleId?: unknown;
    status?: unknown;
  };

  if (typeof title !== "string" || title.trim().length < 3) {
    return {
      ok: false,
      erro: "Campo título é obrigatório e deve ter pelo menos 3 caracteres",
    };
  }

  if (description !== undefined && typeof description !== "string") {
    return { ok: false, erro: "Campo descrição deve ser uma string" };
  }

  if (typeof responsibleId !== "string" || !mongoose.isValidObjectId(responsibleId)) {
    return {
      ok: false,
      erro: "Campo responsável é obrigatório e deve ser um ID válido",
    };
  }

  if (
    typeof status !== "string" ||
    !PAUTA_ITEM_STATUS.includes(status as PautaItemStatus)
  ) {
    return { ok: false, erro: "Campo status é obrigatório e deve ser um status válido" };
  }

  return {
    ok: true,
    data: {
      title: title.trim(),
      description: typeof description === "string" ? description.trim() : "",
      responsibleId: responsibleId.trim(),
      status: status as PautaItemStatus,
    },
  };
}

function routeParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
}

function requirePautaId(
  value: string | string[] | undefined,
  res: Response
): string | null {
  const id = routeParam(value);
  if (!id || !mongoose.isValidObjectId(id)) {
    res.status(400).json({ erro: "ID da pauta inválido" });
    return null;
  }
  return id;
}

function requireItemId(
  value: string | string[] | undefined,
  res: Response
): string | null {
  const id = routeParam(value);
  if (!id || !mongoose.isValidObjectId(id)) {
    res.status(400).json({ erro: "ID do item inválido" });
    return null;
  }
  return id;
}

function findItemIndex(
  items: PautaItemTypeDoc[],
  itemId: string
): number {
  return items.findIndex((item) => asIdString(item._id) === itemId);
}

export async function list(req: Request, res: Response): Promise<void> {
  const requested =
    typeof req.query.management === "string" ? req.query.management.trim() : "";
  const club = await clubManagementsFromSettings();
  const management = requested || club.currentManagement;

  await Pautas.updateMany(
    { "items.status": "discutido" },
    { $set: { "items.$[item].status": "pendente" } },
    { arrayFilters: [{ "item.status": "discutido" }] }
  );

  const itens = await Pautas.find(management ? { management } : { _id: { $exists: false } })
    .sort({ meetingDate: -1, createdAt: -1 })
    .lean();

  const linkedCalendarIds = Array.from(
    new Set(
      itens
        .map((item) =>
          asIdString((item as { calendarEventId?: unknown }).calendarEventId)
        )
        .filter(Boolean)
    )
  );

  if (linkedCalendarIds.length > 0) {
    await Promise.all(
      linkedCalendarIds.map((calendarEventId) =>
        syncPautasWithAcceptedCalendarMembers(calendarEventId)
      )
    );
  }

  const refreshed =
    linkedCalendarIds.length > 0
      ? await Pautas.find(management ? { management } : { _id: { $exists: false } })
          .sort({ meetingDate: -1, createdAt: -1 })
          .lean()
      : itens;

  res.json(
    refreshed.map((item) => serialize(item as unknown as PautasTypeDoc))
  );
}

export async function create(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.sub;
  if (!userId || !mongoose.isValidObjectId(userId)) {
    res.status(401).json({ erro: "Token de autenticação necessário" });
    return;
  }

  const club = await clubManagementsFromSettings();
  const parsed = parsePautaBody(req.body);
  if (!parsed.ok) {
    res.status(400).json({ erro: parsed.erro });
    return;
  }

  const presentMemberIds = await mergeAcceptedIntoPresent(
    parsed.data.presentMemberIds,
    parsed.data.calendarEventId
  );

  const criada = await Pautas.create({
    title: parsed.data.title,
    meetingDate: new Date(`${parsed.data.meetingDate}T00:00:00.000Z`),
    type: parsed.data.type,
    status: parsed.data.status,
    notes: parsed.data.notes,
    presentMemberIds,
    calendarEventId: parsed.data.calendarEventId
      ? new mongoose.Types.ObjectId(parsed.data.calendarEventId)
      : null,
    items: [],
    generatedAt: null,
    management: club.currentManagement,
  });

  await notifyMembers(
    presentMemberIds,
    "Você foi incluído em uma pauta",
    `Você consta como presente na pauta "${parsed.data.title}".`
  );

  res.status(201).json(serialize(criada.toObject() as PautasTypeDoc));
}

export async function update(req: Request, res: Response): Promise<void> {
  const id = requirePautaId(req.params.id, res);
  if (!id) return;

  const parsed = parsePautaBody(req.body);
  if (!parsed.ok) {
    res.status(400).json({ erro: parsed.erro });
    return;
  }

  const anterior = await Pautas.findById(id).lean();
  if (!anterior) {
    res.status(404).json({ erro: "Pauta não encontrada" });
    return;
  }

  const presentMemberIds = await mergeAcceptedIntoPresent(
    parsed.data.presentMemberIds,
    parsed.data.calendarEventId
  );

  const atualizada = await Pautas.findByIdAndUpdate(
    id,
    {
      title: parsed.data.title,
      meetingDate: new Date(`${parsed.data.meetingDate}T00:00:00.000Z`),
      type: parsed.data.type,
      status: parsed.data.status,
      notes: parsed.data.notes,
      presentMemberIds,
      calendarEventId: parsed.data.calendarEventId
        ? new mongoose.Types.ObjectId(parsed.data.calendarEventId)
        : null,
      generatedAt: null,
    },
    { new: true, runValidators: true }
  ).lean();

  if (!atualizada) {
    res.status(404).json({ erro: "Pauta não encontrada" });
    return;
  }

  const idsAnteriores = new Set((anterior.presentMemberIds ?? []).map(asIdString));
  const idsAtuais = new Set(presentMemberIds);
  const incluidos = presentMemberIds.filter((memberId) => !idsAnteriores.has(memberId));
  const removidos = Array.from(idsAnteriores).filter((memberId) => !idsAtuais.has(memberId));
  const mantidos = presentMemberIds.filter((memberId) => idsAnteriores.has(memberId));

  await Promise.all([
    notifyMembers(
      incluidos,
      "Você foi incluído em uma pauta",
      `Você consta como presente na pauta "${parsed.data.title}".`
    ),
    notifyMembers(
      removidos,
      "Você foi removido de uma pauta",
      `Você não consta mais como presente na pauta "${asIdString(anterior.title) || parsed.data.title}".`
    ),
    notifyMembers(
      mantidos,
      "Uma pauta foi atualizada",
      `A pauta "${parsed.data.title}" foi atualizada.`
    ),
  ]);

  res.json(serialize(atualizada as unknown as PautasTypeDoc));
}

export async function remove(req: Request, res: Response): Promise<void> {
  const id = requirePautaId(req.params.id, res);
  if (!id) return;

  const removida = await Pautas.findByIdAndDelete(id).lean();
  if (!removida) {
    res.status(404).json({ erro: "Pauta não encontrada" });
    return;
  }

  await notifyMembers(
    (removida.presentMemberIds ?? []).map(asIdString),
    "Uma pauta foi removida",
    `A pauta "${asIdString(removida.title)}" foi removida.`
  );

  res.status(204).send();
}

export async function duplicate(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = requirePautaId(req.params.id, res);
  if (!id) return;

  const userId = req.user?.sub;
  if (!userId || !mongoose.isValidObjectId(userId)) {
    res.status(401).json({ erro: "Token de autenticação necessário" });
    return;
  }

  const current = await Pautas.findById(id).lean();
  if (!current) {
    res.status(404).json({ erro: "Pauta não encontrada" });
    return;
  }

  const items = sortItems((current.items ?? []) as PautaItemTypeDoc[]).map(
    (item, index) => ({
      title: item.title,
      description: item.description ?? "",
      responsibleId: item.responsibleId,
      status: item.status === "resolvido" ? ("pendente" as const) : item.status,
      order: index + 1,
    })
  );

  const criada = await Pautas.create({
    title: `${current.title} (cópia)`,
    meetingDate: current.meetingDate,
    type: current.type,
    status: "rascunho",
    notes: current.notes ?? "",
    presentMemberIds: current.presentMemberIds ?? [],
    calendarEventId: current.calendarEventId ?? null,
    items,
    generatedAt: null,
    management: current.management,
  });

  res.status(201).json(serialize(criada.toObject() as PautasTypeDoc));
}

export async function generate(req: Request, res: Response): Promise<void> {
  const id = requirePautaId(req.params.id, res);
  if (!id) return;

  const atualizada = await Pautas.findByIdAndUpdate(
    id,
    { generatedAt: new Date() },
    { new: true, runValidators: true }
  ).lean();

  if (!atualizada) {
    res.status(404).json({ erro: "Pauta não encontrada" });
    return;
  }

  res.json(serialize(atualizada as unknown as PautasTypeDoc));
}

export async function createItem(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = requirePautaId(req.params.id, res);
  if (!id) return;

  const userId = req.user?.sub;
  if (!userId || !mongoose.isValidObjectId(userId)) {
    res.status(401).json({ erro: "Token de autenticação necessário" });
    return;
  }

  const parsed = parseItemBody(req.body);
  if (!parsed.ok) {
    res.status(400).json({ erro: parsed.erro });
    return;
  }

  const pauta = await Pautas.findById(id);
  if (!pauta) {
    res.status(404).json({ erro: "Pauta não encontrada" });
    return;
  }

  const nextOrder =
    (pauta.items ?? []).reduce((max, item) => Math.max(max, item.order), 0) + 1;

  pauta.items.push({
    title: parsed.data.title,
    description: parsed.data.description,
    responsibleId: new mongoose.Types.ObjectId(parsed.data.responsibleId),
    status: parsed.data.status,
    order: nextOrder,
  } as PautaItemTypeDoc);
  pauta.generatedAt = null;
  await pauta.save();

  await notifyMembers(
    [parsed.data.responsibleId],
    "Você recebeu um item de pauta",
    `Você é o responsável pelo item "${parsed.data.title}" na pauta "${pauta.title}".`
  );

  res.status(201).json(serialize(pauta.toObject() as PautasTypeDoc));
}

export async function updateItem(req: Request, res: Response): Promise<void> {
  const id = requirePautaId(req.params.id, res);
  const itemId = requireItemId(req.params.itemId, res);
  if (!id || !itemId) return;

  const parsed = parseItemBody(req.body);
  if (!parsed.ok) {
    res.status(400).json({ erro: parsed.erro });
    return;
  }

  const pauta = await Pautas.findById(id);
  if (!pauta) {
    res.status(404).json({ erro: "Pauta não encontrada" });
    return;
  }

  const itemIndex = findItemIndex(pauta.items as PautaItemTypeDoc[], itemId);
  const item = pauta.items[itemIndex];
  if (itemIndex < 0 || !item) {
    res.status(404).json({ erro: "Item da pauta não encontrado" });
    return;
  }

  const responsibleAnterior = asIdString(item.responsibleId);
  item.title = parsed.data.title;
  item.description = parsed.data.description;
  item.responsibleId = new mongoose.Types.ObjectId(parsed.data.responsibleId);
  item.status = parsed.data.status;
  pauta.generatedAt = null;
  await pauta.save();

  if (responsibleAnterior !== parsed.data.responsibleId) {
    await Promise.all([
      notifyMembers(
        [parsed.data.responsibleId],
        "Você recebeu um item de pauta",
        `Você é o responsável pelo item "${parsed.data.title}" na pauta "${pauta.title}".`
      ),
      notifyMembers(
        [responsibleAnterior],
        "Um item de pauta foi reatribuído",
        `Você não é mais responsável pelo item "${parsed.data.title}" na pauta "${pauta.title}".`
      ),
    ]);
  } else {
    await notifyMembers(
      [parsed.data.responsibleId],
      "Um item de pauta foi atualizado",
      `O item "${parsed.data.title}" da pauta "${pauta.title}" foi atualizado.`
    );
  }

  res.json(serialize(pauta.toObject() as PautasTypeDoc));
}

export async function removeItem(req: Request, res: Response): Promise<void> {
  const id = requirePautaId(req.params.id, res);
  const itemId = requireItemId(req.params.itemId, res);
  if (!id || !itemId) return;

  const pauta = await Pautas.findById(id);
  if (!pauta) {
    res.status(404).json({ erro: "Pauta não encontrada" });
    return;
  }

  const itemIndex = findItemIndex(pauta.items as PautaItemTypeDoc[], itemId);
  const item = pauta.items[itemIndex];
  if (itemIndex < 0 || !item) {
    res.status(404).json({ erro: "Item da pauta não encontrado" });
    return;
  }

  const title = item.title;
  const responsibleId = asIdString(item.responsibleId);
  const remaining = sortItems(
    (pauta.items as PautaItemTypeDoc[]).filter(
      (entry) => asIdString(entry._id) !== itemId
    )
  ).map((entry, index) => ({
    _id: entry._id,
    title: entry.title,
    description: entry.description ?? "",
    responsibleId: entry.responsibleId,
    status: entry.status,
    order: index + 1,
  }));

  pauta.items = remaining as typeof pauta.items;
  pauta.generatedAt = null;
  await pauta.save();

  await notifyMembers(
    [responsibleId],
    "Um item de pauta foi removido",
    `O item "${title}" da pauta "${pauta.title}" foi removido.`
  );

  res.json(serialize(pauta.toObject() as PautasTypeDoc));
}

export async function moveItem(req: Request, res: Response): Promise<void> {
  const id = requirePautaId(req.params.id, res);
  const itemId = requireItemId(req.params.itemId, res);
  if (!id || !itemId) return;

  const direction =
    typeof req.body?.direction === "string" ? req.body.direction.trim() : "";
  if (direction !== "up" && direction !== "down") {
    res.status(400).json({ erro: "Campo direction deve ser 'up' ou 'down'" });
    return;
  }

  const pauta = await Pautas.findById(id);
  if (!pauta) {
    res.status(404).json({ erro: "Pauta não encontrada" });
    return;
  }

  const ordered = sortItems((pauta.items ?? []) as PautaItemTypeDoc[]);
  const index = ordered.findIndex((item) => asIdString(item._id) === itemId);
  if (index < 0) {
    res.status(404).json({ erro: "Item da pauta não encontrado" });
    return;
  }

  const target = direction === "up" ? index - 1 : index + 1;
  if (target >= 0 && target < ordered.length) {
    const currentItem = ordered[index];
    const targetItem = ordered[target];
    if (currentItem && targetItem) {
      ordered[index] = targetItem;
      ordered[target] = currentItem;
    }
  }

  ordered.forEach((item, order) => {
    item.order = order + 1;
  });
  pauta.items = ordered as typeof pauta.items;
  pauta.generatedAt = null;
  await pauta.save();

  res.json(serialize(pauta.toObject() as PautasTypeDoc));
}

export async function importPending(req: Request, res: Response): Promise<void> {
  const id = requirePautaId(req.params.id, res);
  if (!id) return;

  const pauta = await Pautas.findById(id);
  if (!pauta) {
    res.status(404).json({ erro: "Pauta não encontrada" });
    return;
  }

  let sourceId =
    typeof req.body?.sourcePautaId === "string" ? req.body.sourcePautaId.trim() : "";

  if (sourceId) {
    if (!mongoose.isValidObjectId(sourceId)) {
      res.status(400).json({ erro: "ID da pauta de origem inválido" });
      return;
    }
  } else {
    const candidates = await Pautas.find({
      _id: { $ne: id },
      management: pauta.management,
      status: "realizada",
      items: {
        $elemMatch: { status: { $in: ["pendente", "adiado"] } },
      },
    })
      .sort({ meetingDate: -1 })
      .limit(1)
      .lean();

    sourceId = candidates[0]?._id ? asIdString(candidates[0]._id) : "";
    if (!sourceId) {
      res.status(404).json({ erro: "Nenhuma pauta realizada com pendências foi encontrada" });
      return;
    }
  }

  const source = await Pautas.findById(sourceId).lean();
  if (!source) {
    res.status(404).json({ erro: "Pauta de origem não encontrada" });
    return;
  }

  const existingTitles = new Set(
    (pauta.items ?? []).map((item) => item.title.trim().toLowerCase())
  );
  const pending = sortItems((source.items ?? []) as PautaItemTypeDoc[]).filter(
    (item) =>
      (item.status === "pendente" || item.status === "adiado") &&
      !existingTitles.has(item.title.trim().toLowerCase())
  );

  if (pending.length === 0) {
    res.json(serialize(pauta.toObject() as PautasTypeDoc));
    return;
  }

  const startOrder =
    (pauta.items ?? []).reduce((max, item) => Math.max(max, item.order), 0) + 1;

  pending.forEach((item, index) => {
    pauta.items.push({
      title: item.title,
      description: item.description ?? "",
      responsibleId: item.responsibleId,
      status: item.status,
      order: startOrder + index,
    } as PautaItemTypeDoc);
  });

  pauta.generatedAt = null;
  await pauta.save();

  res.json(serialize(pauta.toObject() as PautasTypeDoc));
}
