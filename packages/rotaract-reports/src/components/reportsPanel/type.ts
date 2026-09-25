import type { Reports, ReportsPayload } from "../../types/reports";

export type ReportsPanelProps = {
  reports: Reports[];
  onUpdate: (id: string, payload: ReportsPayload) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
};
