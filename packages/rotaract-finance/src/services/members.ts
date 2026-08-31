export type Member = {
  id: string;
  name: string;
  email?: string;
};

export async function listMembers(signal: AbortSignal): Promise<Member[]> {
  const response = await fetch("/api/users", {
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar os membros");
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Resposta inválida da API de membros");
  }

  return data.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as { id?: unknown; name?: unknown; email?: unknown };
    if (typeof row.id !== "string" || typeof row.name !== "string") return [];
    const member: Member = { id: row.id, name: row.name };
    if (typeof row.email === "string") member.email = row.email;
    return [member];
  });
}
