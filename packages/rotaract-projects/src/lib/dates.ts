export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return toDateInputValue(new Date());
}

export function addDays(value: string | Date, days: number): string {
  const date =
    typeof value === "string" ? new Date(`${value}T00:00:00`) : new Date(value);
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

export function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function createEntityId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}
