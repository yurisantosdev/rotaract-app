import type { Reports, ReportsPayload } from "../../types/reports";

export type ReportModalProps = {
  open: boolean;
  report: Reports | null;
  onClose: () => void;
  onSave: (id: string, payload: ReportsPayload) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
};
