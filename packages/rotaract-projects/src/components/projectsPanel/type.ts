import { Project, ProjectPayload } from "../../../src/types/projects";
import { Task } from "../../../src/types/tasks";
import { Member } from "@rotaract/members";

export type ProjectsPanelProps = {
  projects: Project[];
  tasks: Task[];
  members: Member[];
  currentUserId?: string;
  onOpen: (projectId: string) => void;
  onCreate: (payload: ProjectPayload) => void | Promise<void>;
};