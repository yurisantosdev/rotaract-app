import { Member } from "../../../src";

export type MemberAvatarProps = {
  member: Pick<Member, "name"> & Partial<Pick<Member, "photo">>;
  size?: "sm" | "md" | "xs";
  className?: string;
};