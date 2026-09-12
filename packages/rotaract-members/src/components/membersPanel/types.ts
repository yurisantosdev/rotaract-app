import { Member, MemberPayload } from "../../types/member";

export type MembersPanelProps = {
  members: Member[];
  onCreate: (payload: MemberPayload) => void | Promise<void>;
  onUpdate: (id: string, payload: MemberPayload) => void | Promise<void>;
  onChangeStatus: (member: Member) => void;
};

export type UseMembersPanelProps = {
  members: Member[];
  onCreate: (payload: MemberPayload) => void | Promise<void>;
  onUpdate: (id: string, payload: MemberPayload) => void | Promise<void>;
};
