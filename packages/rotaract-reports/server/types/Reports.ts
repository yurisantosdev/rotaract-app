import type mongoose from "mongoose";

export const ReportsStatus = {
  PENDING: "pending",
  RESOLVED: "resolved",
  PROGRESS: "progress",
} as const;

export type ReportsStatus =
  (typeof ReportsStatus)[keyof typeof ReportsStatus];

export type ReportsTypeDoc = {
  _id: mongoose.Types.ObjectId;
  description: string;
  date: string;
  status: ReportsStatus;
  image?: string;
  memberId: mongoose.Types.ObjectId;
  returnFeedback?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ReportsResponse = {
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

export const REPORTS_STATUS_LABEL: Record<ReportsStatus, string> = {
  pending: "Pendente",
  resolved: "Resolvido",
  progress: "Em andamento",
};
