import mongoose from "mongoose";
import { type ProjectsTypeDoc } from "../types/Projects";

const projectsSchema = new mongoose.Schema(
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
    members: {
      type: [mongoose.Schema.Types.ObjectId],
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
    collection: "projects",
  }
);

export const Projects =
  (mongoose.models.Projects as mongoose.Model<ProjectsTypeDoc> | undefined) ??
  mongoose.model<ProjectsTypeDoc>("Projects", projectsSchema);
