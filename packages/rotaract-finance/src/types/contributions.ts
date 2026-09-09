export type ContributionStatus = "pago" | "pendente" | "isento" | "vencido";

export function isUnpaidContribution(status: ContributionStatus): boolean {
  return status === "pendente" || status === "vencido";
}

export type Contribution = {
  id: string;
  memberId: string;
  name: string;
  reference: string;
  value: number;
  date: string;
  status: ContributionStatus;
  createdAt: Date;
  updatedAt: Date;
};


export const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export type GenerateContributionReference = {
  reference: string;
  date: string;
};

export type GenerateContributionsPayload = {
  memberIds: string[];
  value: number;
  references: GenerateContributionReference[];
};

export function isISODate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function dueDateForReference(reference: string, day = 10): string {
  const [monthName, yearRaw] = reference.split("/");
  const monthIndex = MONTHS.indexOf(monthName?.trim() ?? "");
  const year = Number(yearRaw);

  if (monthIndex < 0 || !Number.isInteger(year) || year < 1900) {
    return "";
  }

  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const clamped = Math.min(Math.max(day, 1), lastDay);
  const month = String(monthIndex + 1).padStart(2, "0");
  const dayValue = String(clamped).padStart(2, "0");

  return `${year}-${month}-${dayValue}`;
}