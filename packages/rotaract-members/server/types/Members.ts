import mongoose from "mongoose";

export const MEMBER_STATUS = ["ativo", "inativo"] as const;
export type MemberStatus = (typeof MEMBER_STATUS)[number];

export const MEMBER_POSITION = ["Presidente", "Vice-Presidente", "Secretário", "Tesoureiro", "Diretor de Projetos", "Diretor de Imagem Pública", "Membro"] as const;
export type MemberPosition = (typeof MEMBER_POSITION)[number];

export type MembersType = {
  _id: mongoose.Types.ObjectId;
  name: string;
  photo?: string;
  email: string;
  password?: string;
  birthDate?: string;
  phone?: string;
  status: MemberStatus;
  position: MemberPosition;
  createdAt: Date;
  updatedAt: Date;
};