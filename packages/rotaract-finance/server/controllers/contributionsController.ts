import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Contribution } from "../models/Contribution";
import { Movement } from "../models/Movement";
import type { AuthenticatedRequest } from "../types/express";
import {
  CONTRIBUTION_MONTHS,
  CONTRIBUTION_STATUS,
  type ContributionResponse,
  type ContributionStatus,
  type ContributionTypeDoc,
} from "../types/Contribution";

function shortName(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).join(" ");
}

function serializar(doc: ContributionTypeDoc, fallbackName = ""): ContributionResponse {
  const name = doc.name?.trim() || fallbackName;
  return {
    id: doc._id.toString(),
    memberId: doc.memberId.toString(),
    name: shortName(name),
    reference: doc.reference,
    value: doc.value,
    status: doc.status ?? "pendente",
    date: doc.date ?? todayISO(),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function memberNameById(
  memberId: mongoose.Types.ObjectId | string | undefined
): Promise<string> {
  if (!memberId || !mongoose.isValidObjectId(memberId)) return "";

  const member = await mongoose.connection
    .collection("members")
    .findOne(
      { _id: new mongoose.Types.ObjectId(memberId.toString()) },
      { projection: { name: 1 } }
    );

  return typeof member?.name === "string" ? member.name.trim() : "";
}

async function memberNamesByIds(
  memberIds: Array<mongoose.Types.ObjectId | string | undefined>
): Promise<Map<string, string>> {
  const uniqueIds = Array.from(
    new Set(
      memberIds
        .filter((id): id is mongoose.Types.ObjectId | string =>
          Boolean(id && mongoose.isValidObjectId(id))
        )
        .map((id) => id.toString())
    )
  );
  const ids = uniqueIds.map((id) => new mongoose.Types.ObjectId(id));

  if (ids.length === 0) return new Map();

  const members = await mongoose.connection
    .collection("members")
    .find({ _id: { $in: ids } }, { projection: { name: 1 } })
    .toArray();

  return new Map(
    members.map((member) => [
      member._id.toString(),
      typeof member.name === "string" ? member.name.trim() : "",
    ])
  );
}

function todayISO(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function parseISODate(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return `${match[1]}-${match[2]}-${match[3]}`;
}

function dueDateForReference(reference: string, day = 10): string | null {
  const [monthName, yearRaw] = reference.split("/");
  const monthIndex = (CONTRIBUTION_MONTHS as readonly string[]).indexOf(
    monthName?.trim() ?? ""
  );
  const year = Number(yearRaw);

  if (monthIndex < 0 || !Number.isInteger(year) || year < 1900) {
    return null;
  }

  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const clamped = Math.min(Math.max(day, 1), lastDay);

  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(clamped).padStart(2, "0")}`;
}

type GenerateReference = {
  reference: string;
  date: string;
};

function parseGenerateReferences(body: {
  references?: unknown;
  reference?: unknown;
}):
  | { ok: true; data: GenerateReference[] }
  | { ok: false; erro: string } {
  const raw = Array.isArray(body.references)
    ? body.references
    : typeof body.reference === "string"
      ? [body.reference]
      : [];

  const parsed: GenerateReference[] = [];
  const seen = new Set<string>();

  for (const item of raw) {
    if (typeof item === "string") {
      const reference = item.trim();
      if (!reference || seen.has(reference)) continue;

      const date = dueDateForReference(reference);
      if (!date) {
        return { ok: false, erro: `Referência inválida: ${reference}` };
      }

      seen.add(reference);
      parsed.push({ reference, date });
      continue;
    }

    if (typeof item !== "object" || item === null) {
      return { ok: false, erro: "Referências inválidas" };
    }

    const referenceValue = (item as { reference?: unknown }).reference;
    const reference =
      typeof referenceValue === "string" ? referenceValue.trim() : "";
    if (!reference) {
      return { ok: false, erro: "Cada referência precisa de um nome" };
    }
    if (seen.has(reference)) continue;

    const date =
      parseISODate((item as { date?: unknown }).date) ??
      dueDateForReference(reference);
    if (!date) {
      return {
        ok: false,
        erro: `Data de vencimento inválida para ${reference}`,
      };
    }

    seen.add(reference);
    parsed.push({ reference, date });
  }

  if (parsed.length === 0) {
    return { ok: false, erro: "Selecione ao menos uma referência" };
  }

  return { ok: true, data: parsed };
}

async function removeMovementForContribution(
  contributionId: mongoose.Types.ObjectId
): Promise<void> {
  await Movement.deleteMany({ contributionId });
}

async function ensureMovementForContribution(
  contribution: ContributionTypeDoc,
  createdBy: mongoose.Types.ObjectId
): Promise<void> {
  const existing = await Movement.findOne({ contributionId: contribution._id });
  if (existing) return;

  const name = contribution.name?.trim() || (await memberNameById(contribution.memberId));
  const member = shortName(name);
  const description = member
    ? `Mensalidade ${contribution.reference} — ${member}`
    : `Mensalidade ${contribution.reference}`;

  await Movement.create({
    date: todayISO(),
    description,
    category: "Mensalidade",
    type: "entrada",
    value: contribution.value,
    createdBy,
    contributionId: contribution._id,
  });
}

async function syncContributionMovement(
  contribution: ContributionTypeDoc,
  createdBy: mongoose.Types.ObjectId
): Promise<void> {
  if (contribution.status === "pago") {
    await ensureMovementForContribution(contribution, createdBy);
    return;
  }

  await removeMovementForContribution(contribution._id);
}

function isContributionStatus(value: string): value is ContributionStatus {
  return (CONTRIBUTION_STATUS as readonly string[]).includes(value);
}

type ContributionInput = {
  memberId: mongoose.Types.ObjectId;
  name: string;
  reference: string;
  value: number;
  status: ContributionStatus;
};

async function withMemberName(
  data: Omit<ContributionInput, "name">
): Promise<{ ok: true; data: ContributionInput } | { ok: false; erro: string }> {
  const name = await memberNameById(data.memberId);
  if (!name) {
    return { ok: false, erro: "Membro não encontrado" };
  }

  return { ok: true, data: { ...data, name } };
}

function parseContributionBody(
  body: unknown
):
  | { ok: true; data: Omit<ContributionInput, "name"> }
  | { ok: false; erro: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, erro: "Corpo da requisição inválido" };
  }

  const { memberId, reference, value, status } = body as {
    memberId?: unknown;
    reference?: unknown;
    value?: unknown;
    status?: unknown;
  };

  if (typeof memberId !== "string" || !mongoose.isValidObjectId(memberId)) {
    return { ok: false, erro: "Campo memberId é obrigatório e deve ser um ID válido" };
  }

  if (typeof reference !== "string" || !reference.trim()) {
    return { ok: false, erro: "Campo reference é obrigatório" };
  }

  const parsedValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return { ok: false, erro: "Campo value deve ser um número maior que zero" };
  }

  const parsedStatus =
    status === undefined || status === null
      ? "pendente"
      : typeof status === "string" && isContributionStatus(status)
        ? status
        : null;

  if (!parsedStatus) {
    return {
      ok: false,
      erro: `Campo status deve ser um de: ${CONTRIBUTION_STATUS.join(", ")}`,
    };
  }

  return {
    ok: true,
    data: {
      memberId: new mongoose.Types.ObjectId(memberId),
      reference: reference.trim(),
      value: parsedValue,
      status: parsedStatus,
    },
  };
}

export async function list(_req: Request, res: Response): Promise<void> {
  const itens = await Contribution.find().sort({ createdAt: -1 }).lean();
  const missingNameIds = itens
    .filter((item) => typeof item.name !== "string" || !item.name.trim())
    .map((item) => item.memberId);
  const names = await memberNamesByIds(missingNameIds);

  res.json(
    itens.map((item) =>
      serializar(
        item as unknown as ContributionTypeDoc,
        names.get(item.memberId.toString()) ?? ""
      )
    )
  );
}

export async function listOverdue(_req: Request, res: Response): Promise<void> {
  const itens = await Contribution.find({ status: "vencido" }).sort({ createdAt: -1 }).lean();
  const missingNameIds = itens
    .filter((item) => typeof item.name !== "string" || !item.name.trim())
    .map((item) => item.memberId);
  const names = await memberNamesByIds(missingNameIds);

  res.json(
    itens.map((item) =>
      serializar(
        item as unknown as ContributionTypeDoc,
        names.get(item.memberId.toString()) ?? ""
      )
    )
  );
}

export async function create(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.sub;
  if (!userId || !mongoose.isValidObjectId(userId)) {
    res.status(401).json({ erro: "Token de autenticação necessário" });
    return;
  }

  const parsed = parseContributionBody(req.body);
  if (!parsed.ok) {
    res.status(400).json({ erro: parsed.erro });
    return;
  }

  const resolved = await withMemberName(parsed.data);
  if (!resolved.ok) {
    res.status(400).json({ erro: resolved.erro });
    return;
  }

  const criada = await Contribution.create(resolved.data);
  const contribution = criada.toObject() as ContributionTypeDoc;
  await syncContributionMovement(
    contribution,
    new mongoose.Types.ObjectId(userId)
  );

  res.status(201).json(serializar(contribution));
}

export async function generate(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.sub;
  if (!userId || !mongoose.isValidObjectId(userId)) {
    res.status(401).json({ erro: "Token de autenticação necessário" });
    return;
  }

  if (typeof req.body !== "object" || req.body === null) {
    res.status(400).json({ erro: "Corpo da requisição inválido" });
    return;
  }

  const { memberIds, references, reference, value } = req.body as {
    memberIds?: unknown;
    references?: unknown;
    reference?: unknown;
    value?: unknown;
  };

  if (!Array.isArray(memberIds) || memberIds.length === 0) {
    res.status(400).json({ erro: "Selecione ao menos um membro" });
    return;
  }

  const validIds = memberIds.filter(
    (id): id is string => typeof id === "string" && mongoose.isValidObjectId(id)
  );
  if (validIds.length !== memberIds.length) {
    res.status(400).json({ erro: "Um ou mais memberIds são inválidos" });
    return;
  }

  const parsedReferences = parseGenerateReferences({ references, reference });
  if (!parsedReferences.ok) {
    res.status(400).json({ erro: parsedReferences.erro });
    return;
  }

  const trimmedReferences = parsedReferences.data.map((item) => item.reference);
  const dateByReference = new Map(
    parsedReferences.data.map((item) => [item.reference, item.date])
  );

  const parsedValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    res.status(400).json({ erro: "Campo value deve ser um número maior que zero" });
    return;
  }

  const objectIds = validIds.map((id) => new mongoose.Types.ObjectId(id));
  const names = await memberNamesByIds(objectIds);
  const missing = validIds.filter((id) => !names.get(id));
  if (missing.length > 0) {
    res.status(400).json({ erro: "Um ou mais membros não foram encontrados" });
    return;
  }

  const existing = await Contribution.find({
    reference: { $in: trimmedReferences },
    memberId: { $in: objectIds },
  })
    .select("memberId reference")
    .lean();

  const existingKeys = new Set(
    existing.map((item) => `${item.memberId.toString()}::${item.reference}`)
  );

  const toCreate = objectIds.flatMap((memberId) =>
    trimmedReferences
      .filter((item) => !existingKeys.has(`${memberId.toString()}::${item}`))
      .map((item) => ({
        memberId,
        name: names.get(memberId.toString()) ?? "",
        reference: item,
        value: parsedValue,
        date: dateByReference.get(item) ?? todayISO(),
        status: "pendente" as const,
      }))
  );

  const skipped =
    objectIds.length * trimmedReferences.length - toCreate.length;

  if (toCreate.length === 0) {
    res.status(200).json({ created: [], skipped });
    return;
  }

  const inserted = await Contribution.insertMany(toCreate);

  const docs = inserted.map((item) => item.toObject() as ContributionTypeDoc);

  res.status(201).json({
    created: docs.map((item) => serializar(item)),
    skipped,
  });
}

export async function update(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.sub;
  if (!userId || !mongoose.isValidObjectId(userId)) {
    res.status(401).json({ erro: "Token de autenticação necessário" });
    return;
  }

  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ erro: "ID inválido" });
    return;
  }

  const parsed = parseContributionBody(req.body);
  if (!parsed.ok) {
    res.status(400).json({ erro: parsed.erro });
    return;
  }

  const resolved = await withMemberName(parsed.data);
  if (!resolved.ok) {
    res.status(400).json({ erro: resolved.erro });
    return;
  }

  const atualizada = await Contribution.findByIdAndUpdate(id, resolved.data, {
    new: true,
    runValidators: true,
  }).lean();

  if (!atualizada) {
    res.status(404).json({ erro: "Mensalidade não encontrada" });
    return;
  }

  const contribution = atualizada as unknown as ContributionTypeDoc;
  await syncContributionMovement(
    contribution,
    new mongoose.Types.ObjectId(userId)
  );

  res.json(serializar(contribution));
}

export async function remove(req: Request, res: Response): Promise<void> {
  const id = typeof req.params.id === "string" ? req.params.id : undefined;
  if (!id || !mongoose.isValidObjectId(id)) {
    res.status(400).json({ erro: "ID inválido" });
    return;
  }

  const contributionId = new mongoose.Types.ObjectId(id);
  const removida = await Contribution.findByIdAndDelete(id).lean();
  if (!removida) {
    res.status(404).json({ erro: "Mensalidade não encontrada" });
    return;
  }

  await removeMovementForContribution(contributionId);

  res.status(204).send();
}

export async function exempt(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.sub;
  if (!userId || !mongoose.isValidObjectId(userId)) {
    res.status(401).json({ erro: "Token de autenticação necessário" });
    return;
  }

  const id = typeof req.params.id === "string" ? req.params.id : undefined;
  if (!id || !mongoose.isValidObjectId(id)) {
    res.status(400).json({ erro: "ID inválido" });
    return;
  }

  const atualizada = await Contribution.findByIdAndUpdate(
    id,
    { status: "isento" },
    { new: true, runValidators: true }
  ).lean();

  if (!atualizada) {
    res.status(404).json({ erro: "Mensalidade não encontrada" });
    return;
  }

  const contribution = atualizada as unknown as ContributionTypeDoc;
  await removeMovementForContribution(contribution._id);

  res.json(
    serializar(
      contribution,
      contribution.name?.trim() ? "" : await memberNameById(contribution.memberId)
    )
  );
}
