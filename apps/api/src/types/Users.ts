import mongoose from "mongoose";

export type UsersType = {
  _id: mongoose.Types.ObjectId;
  name: string;
  photo?: string;
  email: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
};