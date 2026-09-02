import {
  MEMBER_ROLES,
  type Member,
  type MemberPayload,
  type MemberRole,
  type MemberStatus,
} from "../types/member";

const MEMBERS_URL = "/api/members";

function asRole(value: unknown): MemberRole {
  if (value === "Vice-Presidente") return "Vice-presidente";
  if (typeof value === "string" && MEMBER_ROLES.includes(value as MemberRole)) {
    return value as MemberRole;
  }
  return "Membro";
}

function asStatus(value: unknown): MemberStatus {
  return value === "inativo" ? "inativo" : "ativo";
}

const API_POSITIONS = [
  "Presidente",
  "Vice-Presidente",
  "Secretário",
  "Tesoureiro",
  "Diretor de Projetos",
  "Diretor de Imagem Pública",
  "Membro",
] as const;

function toApiPosition(role: MemberRole): string {
  if (role === "Vice-presidente") return "Vice-Presidente";
  if ((API_POSITIONS as readonly string[]).includes(role)) return role;
  return "Membro";
}

function toDateInput(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;

  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);

  const br = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (br) {
    return `${br[3]}-${br[2].padStart(2, "0")}-${br[1].padStart(2, "0")}`;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10);
}

function parseMember(data: unknown): Member {
  if (!data || typeof data !== "object") {
    throw new Error("Resposta inválida da API de membros");
  }

  const row = data as Record<string, unknown>;
  if (typeof row.id !== "string" || typeof row.name !== "string") {
    throw new Error("Resposta inválida da API de membros");
  }

  const createdAt = typeof row.createdAt === "string" ? row.createdAt : "";

  return {
    id: row.id,
    name: row.name,
    email: typeof row.email === "string" ? row.email : "",
    phone: typeof row.phone === "string" ? row.phone : undefined,
    photo: typeof row.photo === "string" ? row.photo : undefined,
    birthDate: toDateInput(row.birthDate),
    role: asRole(row.role ?? row.position),
    status: asStatus(row.status),
    joinedAt:
      typeof row.joinedAt === "string" ? row.joinedAt : createdAt.slice(0, 10),
  };
}

function toApiBody(member: MemberPayload) {
  return {
    name: member.name,
    email: member.email,
    photo: member.photo,
    birthDate: member.birthDate,
    phone: member.phone,
    status: member.status,
    position: toApiPosition(member.role),
    ...(member.password ? { password: member.password } : {}),
  };
}

export async function listMembers(signal: AbortSignal): Promise<Member[]> {
  const response = await fetch(MEMBERS_URL, {
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

  return data.map(parseMember);
}

export async function createMembers(
  signal: AbortSignal,
  member: MemberPayload
): Promise<Member> {
  const response = await fetch(MEMBERS_URL, {
    method: "POST",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toApiBody(member)),
  });

  if (!response.ok) {
    throw new Error(
      response.status === 409
        ? "Já existe um membro com este e-mail."
        : "Não foi possível salvar o membro"
    );
  }

  return parseMember(await response.json());
}

async function readApiError(response: Response, fallback: string): Promise<string> {
  if (response.status === 409) {
    return "Já existe um membro com este e-mail.";
  }

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

export async function updateMembers(
  id: string,
  signal: AbortSignal,
  member: MemberPayload
): Promise<Member> {
  const response = await fetch(`${MEMBERS_URL}/${id}`, {
    method: "PUT",
    signal,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toApiBody(member)),
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, "Não foi possível atualizar o membro"));
  }

  return parseMember(await response.json());
}