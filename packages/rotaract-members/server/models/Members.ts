import mongoose from "mongoose";
import { MEMBER_POSITION, MEMBER_STATUS, MembersType } from "../types/Members";

const membersSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    photo: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      sparse: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    birthDate: {
      type: String,
      required: false,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
      enum: MEMBER_STATUS,
    },
    position: {
      type: String,
      required: true,
      trim: true,
      enum: MEMBER_POSITION,
    },
  },
  {
    timestamps: true,
    collection: "members",
  }
);

export const Member =
  (mongoose.models.Member as mongoose.Model<MembersType> | undefined) ??
  mongoose.model<MembersType>("Member", membersSchema);
