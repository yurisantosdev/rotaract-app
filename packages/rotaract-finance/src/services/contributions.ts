import { Contribution } from "../types/contributions";

const CONTRIBUTIONS_URL = "/api/finance/contributions";

export async function listContributions(signal: AbortSignal): Promise<Contribution[]> {
  const response = await fetch(CONTRIBUTIONS_URL, {
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar as mensalidades");
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Resposta inválida da API de mensalidades");
  }

  return data;
}

export async function removeContribution(
  id: string,
  signal: AbortSignal
): Promise<void> {
  const response = await fetch(`${CONTRIBUTIONS_URL}/${id}`, {
    method: "DELETE",
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Não foi possível remover a mensalidade");
  }
}

export async function updateContribution(
  id: string,
  signal: AbortSignal,
  contribution: Contribution
): Promise<Contribution> {
  const response = await fetch(`${CONTRIBUTIONS_URL}/${id}`, {
    method: "PUT",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      memberId: contribution.memberId,
      reference: contribution.reference,
      value: contribution.value,
      status: contribution.status,
    }),
  });

  if (!response.ok) {
    throw new Error("Não foi possível atualizar a mensalidade");
  }

  return response.json();
}

export async function exemptContribution(
  id: string,
  signal: AbortSignal
): Promise<Contribution> {
  const response = await fetch(`${CONTRIBUTIONS_URL}/${id}/exempt`, {
    method: "PATCH",
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Não foi possível isentar a mensalidade");
  }

  return response.json();
}