import type mongoose from "mongoose";

export const TASK_STATUS = [
  "new",
  "pending",
  "in_progress",
  "completed",
  "cancelled",
] as const;
export type TaskStatus = (typeof TASK_STATUS)[number];

export type TasksTypeDoc = {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  managerId: string;
  projectId: string;
  date: string;
  status: TaskStatus;
  limit: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TasksResponse = {
  id: string;
  title: string;
  description: string;
  managerId: string;
  projectId: string;
  date: string;
  status: TaskStatus;
  limit: string;
  createdAt: Date;
  updatedAt: Date;
};
