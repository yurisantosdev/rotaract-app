export type TimeSelectProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  fixedPopover?: boolean;
  minuteStep?: number;
};
