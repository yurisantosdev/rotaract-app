import mongoose from "mongoose";
import {
  MOVEMENT_CATEGORIES,
  MOVEMENT_TYPES,
  type MovementTypeDoc,
} from "../types/Movement";

const movementSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: MOVEMENT_CATEGORIES,
    },
    type: {
      type: String,
      required: true,
      enum: MOVEMENT_TYPES,
    },
    value: {
      type: Number,
      required: true,
      min: 0.01,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contributionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contribution",
      required: false,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
    collection: "movements",
  }
);

export const Movement =
  (mongoose.models.Movement as mongoose.Model<MovementTypeDoc> | undefined) ??
  mongoose.model<MovementTypeDoc>("Movement", movementSchema);
