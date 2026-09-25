import mongoose from "mongoose";
import { ReportsStatus, type ReportsTypeDoc } from "../types/Reports";

const reportsSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(ReportsStatus),
      default: ReportsStatus.PENDING,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: false,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    returnFeedback: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "reports",
  }
);

export const Reports =
  (mongoose.models.Reports as mongoose.Model<ReportsTypeDoc> | undefined) ??
  mongoose.model<ReportsTypeDoc>("Reports", reportsSchema);
