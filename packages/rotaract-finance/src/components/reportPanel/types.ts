import { Contribution } from "../../types/contributions";
import { Movement } from "../../types/movement";

export type ReportPanelProps = {
  movements: Movement[];
  contributions: Contribution[];
  onDownload: () => void;
};

export type UseReportPanelProps = {
  movements: Movement[];
  contributions: Contribution[];
}