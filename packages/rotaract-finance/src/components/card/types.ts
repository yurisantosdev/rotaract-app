export type CardProps = {
  title: string;
  number: number;
  colorNumber: "green" | "red" | "black";
  description?: string;
  formatCurrency?: boolean;
};