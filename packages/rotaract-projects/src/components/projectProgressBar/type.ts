export type ProjectProgressBarProps = {
  completed: number;
  total: number;
  percent: number;
  delayMs?: number;
  className?: string;
  itemLabel?: {
    singular: string;
    plural: string;
  };
};