import { Setting, type SettingPayload } from "../types/settings";

const SETTINGS_URL = "/api/settings";

export async function listSettings(signal: AbortSignal): Promise<Setting[]> {
  const response = await fetch(SETTINGS_URL, {
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

export async function createSettings(
  signal: AbortSignal,
  setting: SettingPayload
): Promise<Setting> {
  const response = await fetch(SETTINGS_URL, {
    method: "POST",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(setting),
  });

  if (!response.ok) {
    throw new Error("Não foi possível salvar a configuração");
  }

  return response.json();
}

export async function updateSettings(
  id: string,
  signal: AbortSignal,
  setting: SettingPayload
): Promise<Setting> {
  const response = await fetch(`${SETTINGS_URL}/${id}`, {
    method: "PUT",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(setting),
  });

  if (!response.ok) {
    throw new Error("Não foi possível atualizar a configuração");
  }

  return response.json();
}
