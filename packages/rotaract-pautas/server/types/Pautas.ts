import type mongoose from "mongoose";

export const PAUTA_STATUS = [
  "rascunho",
  "agendada",
  "realizada",
  "cancelada",
] as const;
export type PautaStatus = (typeof PAUTA_STATUS)[number];

export const PAUTA_TYPES = ["ordinaria", "extraordinaria", "diretoria"] as const;
export type PautaType = (typeof PAUTA_TYPES)[number];

export const PAUTA_ITEM_STATUS = [
  "pendente",
  "adiado",
  "resolvido",
] as const;
export type PautaItemStatus = (typeof PAUTA_ITEM_STATUS)[number];

export type PautaItemTypeDoc = {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  responsibleId: mongoose.Types.ObjectId | string;
  status: PautaItemStatus;
  management: string;
  order: number;
};

export type PautasTypeDoc = {
  _id: mongoose.Types.ObjectId;
  title: string;
  meetingDate: Date | string;
  type: PautaType;
  status: PautaStatus;
  notes: string;
  presentMemberIds: Array<mongoose.Types.ObjectId | string>;
  items: PautaItemTypeDoc[];
  calendarEventId: mongoose.Types.ObjectId | string | null;
  generatedAt: Date | string | null;
  management: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PautaItemResponse = {
  id: string;
  title: string;
  description: string;
  responsibleId: string;
  status: PautaItemStatus;
  order: number;
  management: string;
};

export type PautasResponse = {
  id: string;
  title: string;
  meetingDate: string;
  type: PautaType;
  status: PautaStatus;
  notes: string;
  presentMemberIds: string[];
  items: PautaItemResponse[];
  calendarEventId: string | null;
  generatedAt: string | null;
  management: string;
  createdAt: Date;
  updatedAt: Date;
};
