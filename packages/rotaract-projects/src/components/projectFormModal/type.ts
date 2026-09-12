import { Member } from "@rotaract/members";
import { Project, ProjectPayload } from "../../../src/types/projects";

export type ProjectFormModalProps = {
  open: boolean;
  project: Project | null;
  members: Member[];
  currentUserId?: string;
  onClose: () => void;
  onSave: (payload: ProjectPayload) => void | Promise<void>;
};