import { Notices, type NoticesPayload } from "../types/notices";

const NOTICES_URL = "/api/notices";

export async function listNotices(signal: AbortSignal): Promise<Notices[]> {
  const response = await fetch(NOTICES_URL, {
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar as configurações");
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Resposta inválida da API de configurações");
  }

  return data;
}

export async function createNotices(
  signal: AbortSignal,
  notices: NoticesPayload
): Promise<Notices> {
  const response = await fetch(NOTICES_URL, {
    method: "POST",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(notices),
  });

  if (!response.ok) {
    throw new Error("Não foi possível salvar a notificação");
  }

  return response.json();
}

export async function readAllNotices(
  id: string,
  signal: AbortSignal,
): Promise<Notices> {
  const response = await fetch(`${NOTICES_URL}/read-all/${id}`, {
    method: "GET",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Não foi possível ler todas as notificações");
  }

  return response.json();
}
