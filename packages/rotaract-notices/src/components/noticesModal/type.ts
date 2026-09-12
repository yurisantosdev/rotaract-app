import { Notices } from "../../../src/types/notices";

export type NoticesModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: (notices: Notices[]) => void;
};