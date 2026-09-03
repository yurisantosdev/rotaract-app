export type DatePickerLabelFormat = "long" | "short";

export type DatePickerProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  baseDate?: string;
  fixedPopover?: boolean;
  showQuickOptions?: boolean;
  labelFormat?: DatePickerLabelFormat;
  showTime?: boolean;
  time?: string;
  onTimeChange?: (time: string) => void;
  timeLabel?: string;
  minuteStep?: number;
  allowClear?: boolean;
  showToday?: boolean;
  placeholder?: string;
};
