import mongoose from "mongoose";
import { Notices } from "../models/Notices";

export async function createNotice(
  memberId: string,
  title: string,
  message: string
): Promise<void> {
  if (!mongoose.isValidObjectId(memberId)) {
    throw new Error("ID do membro inválido");
  }

  await Notices.create({
    title: title.trim(),
    message: message.trim(),
    memberId: new mongoose.Types.ObjectId(memberId),
    read: false,
    date: new Date().toISOString(),
  });
}
