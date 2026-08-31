import type { ReactNode, RefObject } from "react";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  description?: string;
  children: ReactNode;
  initialFocusRef?: RefObject<HTMLElement | null>;
  showCloseButton?: boolean;
  panelClassName?: string;
};
