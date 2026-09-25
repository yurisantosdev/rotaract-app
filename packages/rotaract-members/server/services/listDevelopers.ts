import { Member } from "../models/Members";
import { MembersResponse, MembersType } from "../types/Members";
import { serializar } from "../controllers/membersController";

export async function listDevelopers(): Promise<MembersResponse[]> {
  const developers = await Member.find({ developer: true })
    .sort({ createdAt: -1 })
    .lean();

  return developers.map((developer) =>
    serializar(developer as unknown as MembersType)
  );
}
