export type ContributionStatus = "pago" | "pendente" | "isento";

export type Contribution = {
  id: string;
  memberId: string;
  name: string;
  reference: string;
  value: number;
  status: ContributionStatus;
  createdAt: Date;
  updatedAt: Date;
};


export const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];