import { Member, MemberPayload } from "../../../src";

export type MemberModalProps = {
  open: boolean;
  member: Member | null;
  onClose: () => void;
  onSave: (payload: MemberPayload) => void | Promise<void>;
};