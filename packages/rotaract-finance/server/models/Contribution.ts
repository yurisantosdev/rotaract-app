import mongoose from "mongoose";
import {
  CONTRIBUTION_STATUS,
  type ContributionTypeDoc,
} from "../types/Contribution";

const contributionSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reference: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0.01,
    },
    status: {
      type: String,
      required: false,
      enum: CONTRIBUTION_STATUS,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "contributions",
  }
);

export const Contribution =
  (mongoose.models.Contribution as mongoose.Model<ContributionTypeDoc> | undefined) ??
  mongoose.model<ContributionTypeDoc>("Contribution", contributionSchema);
