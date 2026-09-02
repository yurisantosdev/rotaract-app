export type MemberStatus = "ativo" | "inativo";

export type MemberRole =
  | "Presidente"
  | "Vice-presidente"
  | "Secretário"
  | "Tesoureiro"
  | "Diretor de Projetos"
  | "Diretor de Imagem Pública"
  | "Diretor de Desenvolvimento do Clube"
  | "Membro";

export type Member = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photo?: string;
  birthDate?: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
};

export type MemberPayload = {
  name: string;
  email: string;
  phone: string;
  photo: string;
  birthDate: string;
  role: MemberRole;
  status: MemberStatus;
  password?: string;
};

export type MemberFilter = "todos" | MemberStatus | "diretoria";

export const MEMBER_ROLES: MemberRole[] = [
  "Presidente",
  "Vice-presidente",
  "Secretário",
  "Tesoureiro",
  "Diretor de Projetos",
  "Diretor de Imagem Pública",
  "Diretor de Desenvolvimento do Clube",
  "Membro",
];

export const MEMBER_FILTERS: { id: MemberFilter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "ativo", label: "Ativos" },
  { id: "inativo", label: "Inativos" },
  { id: "diretoria", label: "Diretoria" },
];

export const MEMBER_INPUT_CLASS =
  "h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-900 outline-none ring-rotaract-pink/20 transition placeholder:text-zinc-400 focus:border-rotaract-pink/50 focus:bg-white focus:ring-4";

export const PHOTO_ACCEPT = "image/png,image/jpeg,image/webp";
export const PHOTO_MAX_BYTES = 2 * 1024 * 1024;
export const PHOTO_DATA_URL_PATTERN =
  /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=\s]+$/;

export function isBoardRole(role: MemberRole): boolean {
  return role !== "Membro";
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (!first) return "RC";
  if (!last || parts.length === 1) return first.slice(0, 2).toUpperCase();
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

export function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function formatJoinedAt(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", {
    month: "short",
    year: "numeric",
  });
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

export function formatPhone(value: string): string {
  const digits = digitsOnly(value);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function isPhotoDataUrl(value: string): boolean {
  return PHOTO_DATA_URL_PATTERN.test(value.trim());
}

export function formatBirthDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
  });
}

export function isBirthdayThisMonth(value?: string): boolean {
  if (!value) return false;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  return date.getMonth() === new Date().getMonth();
}

export function currentMonthLabel(): string {
  const label = new Date().toLocaleDateString("pt-BR", { month: "long" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function isPastDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() < today.getTime();
}
