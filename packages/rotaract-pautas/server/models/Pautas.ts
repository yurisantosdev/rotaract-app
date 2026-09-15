import mongoose from "mongoose";
import {
  PAUTA_ITEM_STATUS,
  PAUTA_STATUS,
  PAUTA_TYPES,
  type PautasTypeDoc,
} from "../types/Pautas";

const pautaItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      default: "",
      trim: true,
    },
    responsibleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      required: true,
      enum: PAUTA_ITEM_STATUS,
      default: "pendente",
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    }
  },
  { _id: true }
);

const pautasSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    meetingDate: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: PAUTA_TYPES,
    },
    status: {
      type: String,
      required: true,
      enum: PAUTA_STATUS,
      default: "rascunho",
    },
    notes: {
      type: String,
      required: false,
      default: "",
      trim: true,
    },
    presentMemberIds: {
      type: [mongoose.Schema.Types.ObjectId],
      required: true,
      default: [],
      ref: "User",
    },
    calendarEventId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      default: null,
      ref: "calendar",
      index: true,
    },
    items: {
      type: [pautaItemSchema],
      required: true,
      default: [],
    },
    generatedAt: {
      type: Date,
      default: null,
    },
    management: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "pautas",
  }
);

export const Pautas =
  (mongoose.models.Pautas as mongoose.Model<PautasTypeDoc> | undefined) ??
  mongoose.model<PautasTypeDoc>("Pautas", pautasSchema);
