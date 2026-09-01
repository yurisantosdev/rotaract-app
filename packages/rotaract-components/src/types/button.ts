import { ComponentProps, ReactNode } from "react";

export interface ButtonInterface extends ComponentProps<'button'> {
  title?: string;
  icon?: ReactNode;
  loading?: boolean;
}