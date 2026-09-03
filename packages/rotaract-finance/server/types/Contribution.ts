import type mongoose from "mongoose";

export const CONTRIBUTION_STATUS = ["pago", "pendente", "isento"] as const;
export type ContributionStatus = (typeof CONTRIBUTION_STATUS)[number];

export type ContributionTypeDoc = {
  _id: mongoose.Types.ObjectId;
  memberId: mongoose.Types.ObjectId;
  name: string;
  reference: string;
  value: number;
  status: ContributionStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type ContributionResponse = {
  id: string;
  memberId: string;
  name: string;
  reference: string;
  value: number;
  status: ContributionStatus;
  createdAt: Date;
  updatedAt: Date;
};
