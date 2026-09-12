import type { Movement } from "../types/movement";
import type {
  MovementImportIssue,
  MovementImportPayload,
  MovementImportResult,
} from "../types/movementImport";

const IMPORT_BATCH_SIZE = 25;

const MOVEMENTS_URL = "/api/finance/movements";

export async function listMovements(signal: AbortSignal): Promise<Movement[]> {
  const response = await fetch(MOVEMENTS_URL, {
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar as movimentações");
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Resposta inválida da API de movimentações");
  }

  return data;
}

export async function removeMovement(
  id: string,
  signal: AbortSignal
): Promise<void> {
  const response = await fetch(`${MOVEMENTS_URL}/${id}`, {
    method: "DELETE",
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Não foi possível remover a movimentação");
  }
}

export async function updateMovement(
  id: string,
  signal: AbortSignal,
  movement: Movement
): Promise<Movement> {
  const response = await fetch(`${MOVEMENTS_URL}/${id}`, {
    method: "PUT",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      date: movement.date,
      description: movement.description,
      category: movement.category,
      type: movement.type,
      value: movement.value,
    }),
  });

  if (!response.ok) {
    throw new Error("Não foi possível atualizar a movimentação");
  }

  return response.json();
}

export async function createMovement(
  signal: AbortSignal,
  movement: Omit<Movement, "id">
): Promise<Movement> {
  const response = await fetch(MOVEMENTS_URL, {
    method: "POST",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      date: movement.date,
      description: movement.description,
      category: movement.category,
      type: movement.type,
      value: movement.value,
    }),
  });

  if (!response.ok) {
    throw new Error("Não foi possível criar a movimentação");
  }

  return response.json();
}

type ImportApiResponse = {
  created?: Movement[];
  errors?: Array<{ index?: number; row?: number; erro?: string; message?: string }>;
  erro?: string;
};

function chunkItems<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function importMovementsBatch(
  signal: AbortSignal,
  movements: MovementImportPayload[],
  rowNumbers: number[]
): Promise<MovementImportResult> {
  const response = await fetch(`${MOVEMENTS_URL}/import`, {
    method: "POST",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ movements }),
  });

  const data = (await response.json().catch(() => null)) as ImportApiResponse | null;
  const created = Array.isArray(data?.created) ? data.created : [];
  const errors: MovementImportIssue[] = (data?.errors ?? []).map((item) => {
    const index = typeof item.index === "number" ? item.index : -1;
    const row =
      typeof item.row === "number"
        ? item.row
        : index >= 0
          ? (rowNumbers[index] ?? index + 2)
          : 0;

    return {
      row,
      message: item.message ?? item.erro ?? "Não foi possível salvar esta linha.",
    };
  });

  if (!response.ok && created.length === 0 && errors.length === 0) {
    throw new Error(data?.erro ?? "Não foi possível importar as movimentações");
  }

  return { created, errors };
}

export async function importMovements(
  signal: AbortSignal,
  rows: Array<{ row: number; data: MovementImportPayload }>,
  onProgress?: (saved: number, total: number) => void
): Promise<MovementImportResult> {
  if (rows.length === 0) {
    return { created: [], errors: [] };
  }

  const created: Movement[] = [];
  const errors: MovementImportIssue[] = [];
  const batches = chunkItems(rows, IMPORT_BATCH_SIZE);
  let saved = 0;

  for (const batch of batches) {
    const result = await importMovementsBatch(
      signal,
      batch.map((item) => item.data),
      batch.map((item) => item.row)
    );
    created.push(...result.created);
    errors.push(...result.errors);
    saved += batch.length;
    onProgress?.(saved, rows.length);
  }

  return { created, errors };
}