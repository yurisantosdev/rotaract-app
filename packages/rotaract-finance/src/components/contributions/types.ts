import { Contribution, GenerateContributionsPayload } from "../../types/contributions";

export type ContributionsPanelProps = {
  contributions: Contribution[];
  onToggle: (ids: string[]) => void | Promise<void>;
  onExempt: (ids: string[]) => void | Promise<void>;
  onRemove: (ids: string[]) => void | Promise<void>;
  onGenerate: (payload: GenerateContributionsPayload) => void | Promise<void>;
};

export type BusyKind = "pay" | "pending" | "exempt" | "remove";

export type BusyState = {
  ids: string[];
  kind: BusyKind;
  scope: "row" | "bulk";
};

export type UseContributionsProps = Pick<ContributionsPanelProps, "contributions">;
