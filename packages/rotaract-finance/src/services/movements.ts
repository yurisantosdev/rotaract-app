import type { Movement } from "../types/movement";

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