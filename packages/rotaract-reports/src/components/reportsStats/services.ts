import { Reports, ReportsStatus } from "../../types/reports";

export function useReportsStats(reports: Reports[]) {
  const pending = reports.filter(
    (item) => item.status === ReportsStatus.PENDING
  ).length;
  const resolved = reports.filter(
    (item) => item.status === ReportsStatus.RESOLVED
  ).length;
  const progress = reports.filter(
    (item) => item.status === ReportsStatus.PROGRESS
  ).length;


  return {
    pending,
    resolved,
    progress
  };
}
