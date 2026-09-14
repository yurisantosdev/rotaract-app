export type ManagementsFieldProps = {
  options: string[];
  selected: string[];
  currentManagement: string;
  onChange: (next: string[]) => void;
  disabled?: boolean;
};
