import type mongoose from "mongoose";

export const MOVEMENT_TYPES = ["entrada", "saida"] as const;
export type MovementType = (typeof MOVEMENT_TYPES)[number];

export const MOVEMENT_CATEGORIES = [
  "Mensalidade",
  "Evento",
  "Doação",
  "Material",
  "Infraestrutura",
  "Outros",
] as const;

export type MovementCategory = (typeof MOVEMENT_CATEGORIES)[number];

export type MovementTypeDoc = {
  _id: mongoose.Types.ObjectId;
  date: string;
  description: string;
  category: MovementCategory;
  type: MovementType;
  value: number;
  createdBy: mongoose.Types.ObjectId;
  contributionId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export type MovementResponse = {
  id: string;
  date: string;
  description: string;
  category: MovementCategory;
  type: MovementType;
  value: number;
  createdAt: Date;
  updatedAt: Date;
};
