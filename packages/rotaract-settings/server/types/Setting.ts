import type mongoose from "mongoose";

export type SettingTypeDoc = {
  _id: mongoose.Types.ObjectId;
  valueContribution: number;
  logo: string;
  nameClub: string;
  currentManagement: string;
  managements: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type SettingResponse = {
  id: string;
  valueContribution: number;
  logo: string;
  nameClub: string;
  currentManagement: string;
  managements: string[];
  createdAt: Date;
  updatedAt: Date;
};
