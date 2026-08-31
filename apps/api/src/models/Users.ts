import mongoose from "mongoose";
import { UsersType } from "../types/Users";

const usersSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
    collection: "users",
  }
);

export const User =
  (mongoose.models.User as mongoose.Model<UsersType> | undefined) ??
  mongoose.model<UsersType>("User", usersSchema);
