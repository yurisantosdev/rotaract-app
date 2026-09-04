import type mongoose from "mongoose";

export type NoticesTypeDoc = {
  _id: mongoose.Types.ObjectId;
  title: string;
  message: string;
  memberId: mongoose.Types.ObjectId;
  read: boolean;
  date: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NoticesResponse = {
  id: string;
  title: string;
  message: string;
  memberId: string;
  read: boolean;
  date: string;
  createdAt: Date;
  updatedAt: Date;
};
