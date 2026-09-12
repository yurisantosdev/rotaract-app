import { Member } from "@rotaract/members";

export type MemberPickerProps = {
  members: Member[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  mode?: "single" | "multiple";
  label: string;
  hint?: string;
  lockedIds?: string[];
};