import mongoose from "mongoose";
import { type NoticesTypeDoc } from "../types/Notices";

const noticesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    read: {
      type: Boolean,
      required: true,
      default: false,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "notices",
  }
);

export const Notices =
  (mongoose.models.Notices as mongoose.Model<NoticesTypeDoc> | undefined) ??
  mongoose.model<NoticesTypeDoc>("Noticce", noticesSchema);
