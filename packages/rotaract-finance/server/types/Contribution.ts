import type mongoose from "mongoose";

export const CONTRIBUTION_STATUS = ["pago", "pendente", "isento", "vencido"] as const;
export type ContributionStatus = (typeof CONTRIBUTION_STATUS)[number];

export const CONTRIBUTION_MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

export type ContributionTypeDoc = {
  _id: mongoose.Types.ObjectId;
  memberId: mongoose.Types.ObjectId;
  name: string;
  reference: string;
  value: number;
  date: string
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
  date: string
  status: ContributionStatus;
  createdAt: Date;
  updatedAt: Date;
};
