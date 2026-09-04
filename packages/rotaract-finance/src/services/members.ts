export type Member = {
  id: string;
  name: string;
  email?: string;
  photo?: string;
  role: string;
};

function parseMember(data: unknown): Member | null {
  if (!data || typeof data !== "object") return null;

  const row = data as Record<string, unknown>;
  if (typeof row.id !== "string" || typeof row.name !== "string") return null;

  const role =
    typeof row.role === "string"
      ? row.role
      : typeof row.position === "string"
        ? row.position
        : "Membro";

  return {
    id: row.id,
    name: row.name,
    email: typeof row.email === "string" ? row.email : undefined,
    photo: typeof row.photo === "string" ? row.photo : undefined,
    role,
  };
}

export async function listMembers(signal: AbortSignal): Promise<Member[]> {
  const response = await fetch("/api/members", {
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
    const member = parseMember(item);
    return member ? [member] : [];
  });
}
