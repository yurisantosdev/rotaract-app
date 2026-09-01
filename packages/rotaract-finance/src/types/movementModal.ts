import { FormEvent } from "react";
import { MOVEMENT_CATEGORIES, MovementType } from "./movement";

export type MovementModalProps = {
  open: boolean;
  mode?: "create" | "edit";
  description: string;
  value: string;
  date: string;
  category: (typeof MOVEMENT_CATEGORIES)[number];
  type: MovementType;
  error: string;
  saving?: boolean;
  onDescriptionChange: (value: string) => void;
  onValueChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onCategoryChange: (value: (typeof MOVEMENT_CATEGORIES)[number]) => void;
  onTypeChange: (value: MovementType) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};