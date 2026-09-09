import type mongoose from "mongoose";

export type ProjectsTypeDoc = {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  managerId: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectsResponse = {
  id: string;
  title: string;
  description: string;
  managerId: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
};
