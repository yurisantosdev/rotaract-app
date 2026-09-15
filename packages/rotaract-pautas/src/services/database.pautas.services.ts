import {
  PAUTA_STATUS,
  PAUTA_TYPES,
  type Pauta,
  type PautaPayload,
  type PautaStatus,
  type PautaType,
} from "../types/pautas";
import {
  PAUTA_ITEM_STATUS,
  type PautaItem,
  type PautaItemPayload,
  type PautaItemStatus,
} from "../types/pautaItems";

const PAUTAS_URL = "/api/pautas";

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

function asDateInput(value: unknown): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const parsed = asDateString(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(parsed)) return parsed.slice(0, 10);
  return parsed;
}

function asGeneratedAt(value: unknown): string | null {
  if (!value) return null;
  const text = asDateString(value);
  return text || null;
}

function asPautaStatus(value: unknown): PautaStatus {
  if (typeof value === "string" && PAUTA_STATUS.includes(value as PautaStatus)) {
    return value as PautaStatus;
  }
  return "rascunho";
}

function asPautaType(value: unknown): PautaType {
  if (typeof value === "string" && PAUTA_TYPES.includes(value as PautaType)) {
    return value as PautaType;
  }
  return "ordinaria";
}

function asItemStatus(value: unknown): PautaItemStatus {
  if (value === "discutido") return "pendente";
  if (
    typeof value === "string" &&
    PAUTA_ITEM_STATUS.includes(value as PautaItemStatus)
  ) {
    return value as PautaItemStatus;
  }
  return "pendente";
}

function parseItem(data: unknown): PautaItem | null {
  if (!data || typeof data !== "object") return null;

  const row = data as Record<string, unknown>;
  const id = asId(row.id) || asId(row._id);
  const title = typeof row.title === "string" ? row.title : "";
  const responsibleId = asId(row.responsibleId);

  if (!id || !title || !responsibleId) return null;

  return {
    id,
    title,
    description: typeof row.description === "string" ? row.description : "",
    responsibleId,
    status: asItemStatus(row.status),
    order: typeof row.order === "number" && Number.isFinite(row.order) ? row.order : 0,
  };
}

function parsePauta(data: unknown): Pauta {
  if (!data || typeof data !== "object") {
    throw new Error("Resposta inválida da API de pautas");
  }

  const row = data as Record<string, unknown>;
  const id = asId(row.id) || asId(row._id);
  const title = typeof row.title === "string" ? row.title : "";
  const meetingDate = asDateInput(row.meetingDate);

  if (!id || !title || !meetingDate) {
    throw new Error("Resposta inválida da API de pautas");
  }

  return {
    id,
    title,
    meetingDate,
    type: asPautaType(row.type),
    status: asPautaStatus(row.status),
    notes: typeof row.notes === "string" ? row.notes : "",
    presentMemberIds: Array.isArray(row.presentMemberIds)
      ? row.presentMemberIds.map(asId).filter(Boolean)
      : [],
    items: Array.isArray(row.items)
      ? row.items.flatMap((item) => {
          const parsed = parseItem(item);
          return parsed ? [parsed] : [];
        })
      : [],
    calendarEventId: asId(row.calendarEventId) || null,
    generatedAt: asGeneratedAt(row.generatedAt),
    management: typeof row.management === "string" ? row.management : "",
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

function toPautaApiBody(payload: PautaPayload) {
  return {
    title: payload.title,
    meetingDate: payload.meetingDate,
    type: payload.type,
    status: payload.status,
    notes: payload.notes,
    presentMemberIds: payload.presentMemberIds,
    calendarEventId: payload.calendarEventId ?? null,
  };
}

function toItemApiBody(payload: PautaItemPayload) {
  return {
    title: payload.title,
    description: payload.description,
    responsibleId: payload.responsibleId,
    status: payload.status,
  };
}

export function lastRealizedPauta(
  pautas: Pauta[],
  exceptId?: string
): Pauta | null {
  return (
    pautas
      .filter(
        (item) =>
          item.status === "realizada" &&
          item.id !== exceptId &&
          item.items.some(
            (pautaItem) =>
              pautaItem.status === "pendente" || pautaItem.status === "adiado"
          )
      )
      .sort((a, b) => b.meetingDate.localeCompare(a.meetingDate))[0] ?? null
  );
}

export async function listPautas(
  signal: AbortSignal,
  management: string
): Promise<Pauta[]> {
  const params = new URLSearchParams();
  if (management.trim()) {
    params.set("management", management.trim());
  }
  const query = params.toString();

  const response = await fetch(
    query ? `${PAUTAS_URL}?${query}` : PAUTAS_URL,
    {
      signal,
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Não foi possível carregar as pautas")
    );
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Resposta inválida da API de pautas");
  }

  return data.flatMap((item) => {
    try {
      return [parsePauta(item)];
    } catch {
      return [];
    }
  });
}

export async function createPauta(
  signal: AbortSignal,
  payload: PautaPayload
): Promise<Pauta> {
  const response = await fetch(PAUTAS_URL, {
    method: "POST",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toPautaApiBody(payload)),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Não foi possível salvar a pauta"));
  }

  return parsePauta(await response.json());
}

export async function updatePauta(
  id: string,
  signal: AbortSignal,
  payload: PautaPayload
): Promise<Pauta> {
  const response = await fetch(`${PAUTAS_URL}/${id}`, {
    method: "PUT",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toPautaApiBody(payload)),
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Não foi possível atualizar a pauta")
    );
  }

  return parsePauta(await response.json());
}

export async function removePauta(
  id: string,
  signal: AbortSignal
): Promise<void> {
  const response = await fetch(`${PAUTAS_URL}/${id}`, {
    method: "DELETE",
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Não foi possível excluir a pauta")
    );
  }
}

export async function duplicatePauta(
  id: string,
  signal: AbortSignal
): Promise<Pauta> {
  const response = await fetch(`${PAUTAS_URL}/${id}/duplicate`, {
    method: "POST",
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Não foi possível duplicar a pauta")
    );
  }

  return parsePauta(await response.json());
}

export async function markPautaGenerated(
  id: string,
  signal: AbortSignal
): Promise<Pauta> {
  const response = await fetch(`${PAUTAS_URL}/${id}/generate`, {
    method: "POST",
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Não foi possível gerar a pauta")
    );
  }

  return parsePauta(await response.json());
}

export async function createPautaItem(
  pautaId: string,
  signal: AbortSignal,
  payload: PautaItemPayload
): Promise<Pauta> {
  const response = await fetch(`${PAUTAS_URL}/${pautaId}/items`, {
    method: "POST",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toItemApiBody(payload)),
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Não foi possível salvar o item")
    );
  }

  return parsePauta(await response.json());
}

export async function updatePautaItem(
  pautaId: string,
  itemId: string,
  signal: AbortSignal,
  payload: PautaItemPayload
): Promise<Pauta> {
  const response = await fetch(`${PAUTAS_URL}/${pautaId}/items/${itemId}`, {
    method: "PUT",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toItemApiBody(payload)),
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Não foi possível atualizar o item")
    );
  }

  return parsePauta(await response.json());
}

export async function removePautaItem(
  pautaId: string,
  itemId: string,
  signal: AbortSignal
): Promise<Pauta> {
  const response = await fetch(`${PAUTAS_URL}/${pautaId}/items/${itemId}`, {
    method: "DELETE",
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Não foi possível excluir o item")
    );
  }

  return parsePauta(await response.json());
}

export async function movePautaItem(
  pautaId: string,
  itemId: string,
  signal: AbortSignal,
  direction: "up" | "down"
): Promise<Pauta> {
  const response = await fetch(`${PAUTAS_URL}/${pautaId}/items/${itemId}/move`, {
    method: "POST",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ direction }),
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Não foi possível reordenar o item")
    );
  }

  return parsePauta(await response.json());
}

export async function importPendingItems(
  pautaId: string,
  signal: AbortSignal,
  sourcePautaId?: string
): Promise<Pauta> {
  const response = await fetch(`${PAUTAS_URL}/${pautaId}/import-pending`, {
    method: "POST",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sourcePautaId ? { sourcePautaId } : {}),
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Não foi possível importar as pendências")
    );
  }

  return parsePauta(await response.json());
}
