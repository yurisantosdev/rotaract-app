import { type Reports, type ReportsPayload } from "../types/reports";

const REPORTS_URL = "/api/reports";

export async function listReports(signal: AbortSignal): Promise<Reports[]> {
  const response = await fetch(REPORTS_URL, {
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar os Feedbacks");
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Resposta inválida da API de Feedbacks");
  }

  return data as Reports[];
}

export async function createReports(
  signal: AbortSignal,
  report: Pick<ReportsPayload, "description"> & { image?: string }
): Promise<Reports> {
  const response = await fetch(REPORTS_URL, {
    method: "POST",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(report),
  });

  if (!response.ok) {
    let message = "Não foi possível salvar o Feedback";
    try {
      const payload: unknown = await response.json();
      if (
        typeof payload === "object" &&
        payload !== null &&
        "error" in payload &&
        typeof (payload as { error: unknown }).error === "string"
      ) {
        message = (payload as { error: string }).error;
      }
    } catch {
      if (response.status === 413) {
        message = "A imagem do print é muito grande. Tente novamente.";
      }
    }
    throw new Error(message);
  }

  return response.json();
}

export async function updateReports(
  id: string,
  signal: AbortSignal,
  report: ReportsPayload
): Promise<Reports> {
  const response = await fetch(`${REPORTS_URL}/${id}`, {
    method: "PUT",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(report),
  });

  if (!response.ok) {
    throw new Error("Não foi possível atualizar o Feedback");
  }

  return await response.json();
}

export async function removeReports(
  id: string,
  signal: AbortSignal
): Promise<void> {
  const response = await fetch(`${REPORTS_URL}/${id}`, {
    method: "DELETE",
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Não foi possível excluir o Feedback");
  }
}
