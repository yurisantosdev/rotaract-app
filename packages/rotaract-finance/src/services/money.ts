export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatMoneyInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 12);
  if (!digits) return "";

  const amount = Number(digits) / 100;
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatMoneyFromNumber(value: number): string {
  if (!Number.isFinite(value)) return "";
  return formatMoneyInput(String(Math.round(value * 100)));
}

export function parseMoneyInput(value: string): number {
  const digits = value.replace(/\D/g, "");
  if (!digits) return Number.NaN;
  return Number(digits) / 100;
}

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export function isInCurrentMonth(isoDate: string, now = new Date()): boolean {
  const [year, month] = isoDate.split("-").map(Number);
  if (!year || !month) return false;
  return year === now.getFullYear() && month === now.getMonth() + 1;
}

export function todayISO(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}
