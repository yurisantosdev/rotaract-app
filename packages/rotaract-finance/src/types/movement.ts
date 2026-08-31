export type MovementType = "entrada" | "saida";

export type Tab = "movimentos" | "mensalidades" | "relatorio";

export const tabs: { id: Tab; label: string }[] = [
  { id: "movimentos", label: "Movimentações" },
  { id: "mensalidades", label: "Mensalidades" },
  { id: "relatorio", label: "Prestação de contas" },
];

export const inputClassName =
  "h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-900 outline-none ring-rotaract-pink/20 transition placeholder:text-zinc-400 focus:border-rotaract-pink/50 focus:bg-white focus:ring-4";

export type Movement = {
  id: string;
  date: string;
  description: string;
  category: string;
  type: MovementType;
  value: number;
};

export type ContributionStatus = "pago" | "pendente";

export type Contribution = {
  id: string;
  memberName: string;
  reference: string;
  value: number;
  status: ContributionStatus;
};

export const MOVEMENT_CATEGORIES = [
  "Mensalidade",
  "Evento",
  "Doação",
  "Material",
  "Infraestrutura",
  "Outros",
] as const;

export const INITIAL_CONTRIBUTIONS: Contribution[] = [
  {
    id: "c1",
    memberName: "Ana Souza",
    reference: "Agosto/2026",
    value: 50,
    status: "pago",
  },
  {
    id: "c2",
    memberName: "Bruno Lima",
    reference: "Agosto/2026",
    value: 50,
    status: "pago",
  },
  {
    id: "c3",
    memberName: "Carla Mendes",
    reference: "Agosto/2026",
    value: 50,
    status: "pendente",
  },
  {
    id: "c4",
    memberName: "Diego Martins",
    reference: "Agosto/2026",
    value: 50,
    status: "pendente",
  },
  {
    id: "c5",
    memberName: "Fernanda Alves",
    reference: "Agosto/2026",
    value: 50,
    status: "pago",
  },
];
