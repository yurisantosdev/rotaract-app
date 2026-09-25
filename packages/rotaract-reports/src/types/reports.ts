import { AuthUser } from "@rotaract/members";

export const ReportsStatus = {
  PENDING: "pending",
  RESOLVED: "resolved",
  PROGRESS: "progress",
} as const;

export type ReportsStatus =
  (typeof ReportsStatus)[keyof typeof ReportsStatus];

export type Reports = {
  id: string;
  description: string;
  date: string;
  status: ReportsStatus;
  image?: string;
  memberId: string;
  returnFeedback?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ReportsPayload = {
  description: string;
  status: ReportsStatus;
  returnFeedback: string;
};

export type ReportsFilter = "todos" | ReportsStatus;

export const REPORTS_FILTERS: { id: ReportsFilter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: ReportsStatus.PENDING, label: "Pendentes" },
  { id: ReportsStatus.RESOLVED, label: "Resolvidos" },
  { id: ReportsStatus.PROGRESS, label: "Em andamento" },
];

export const REPORTS_STATUS_OPTIONS: {
  id: ReportsStatus;
  label: string;
}[] = [
    { id: ReportsStatus.PENDING, label: "Pendente" },
    { id: ReportsStatus.RESOLVED, label: "Resolvido" },
    { id: ReportsStatus.PROGRESS, label: "Em andamento" },
  ];

export const REPORTS_STATUS_LABEL: Record<ReportsStatus, string> = {
  pending: "Pendente",
  resolved: "Resolvido",
  progress: "Em andamento",
};

export const REPORTS_INPUT_CLASS =
  "h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-900 outline-none ring-rotaract-pink/20 transition placeholder:text-zinc-400 focus:border-rotaract-pink/50 focus:bg-white focus:ring-4";

export type ReportsPageProps = {
  user: AuthUser;
};

