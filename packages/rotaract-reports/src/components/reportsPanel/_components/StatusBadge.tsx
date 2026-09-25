import {
  REPORTS_STATUS_LABEL,
  type ReportsStatus,
} from "../../../types/reports";

const STATUS_CLASS: Record<ReportsStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  resolved: "bg-emerald-50 text-emerald-700",
  progress: "bg-sky-50 text-sky-700",
};

export function StatusBadge({ status }: { status: ReportsStatus }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASS[status]}`}
    >
      {REPORTS_STATUS_LABEL[status]}
    </span>
  );
}
