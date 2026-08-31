import mongoose from "mongoose";
import { type SettingTypeDoc } from "../types/Setting";

const settingSchema = new mongoose.Schema(
  {
    valueContribution: {
      type: Number,
      required: true,
      min: 0.01,
    },
    logo: {
      type: String,
      required: true,
    },
    nameClub: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "settings",
  }
);

export const Setting =
  (mongoose.models.Setting as mongoose.Model<SettingTypeDoc> | undefined) ??
  mongoose.model<SettingTypeDoc>("Setting", settingSchema);
