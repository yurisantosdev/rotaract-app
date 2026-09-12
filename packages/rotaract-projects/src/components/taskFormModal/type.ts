import { Task, TaskPayload } from "../../../src/types/tasks";
import { Member } from "@rotaract/members";

export type TaskFormModalProps = {
  open: boolean;
  task: Task | null;
  members: Member[];
  defaultManagerId?: string;
  onClose: () => void;
  onSave: (payload: TaskPayload) => void | Promise<void>;
};