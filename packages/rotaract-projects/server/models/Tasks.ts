import mongoose from "mongoose";
import { type TasksTypeDoc, TASK_STATUS } from "../types/Tasks";

const tasksSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Projects",
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: TASK_STATUS,
    },
    limit: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "tasks",
  }
);

export const Tasks =
  (mongoose.models.Tasks as mongoose.Model<TasksTypeDoc> | undefined) ??
  mongoose.model<TasksTypeDoc>("Tasks", tasksSchema);
