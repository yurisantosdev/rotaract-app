export type MovementType = "entrada" | "saida";

export type Movement = {
  id: string;
  date: string;
  description: string;
  category: string;
  type: MovementType;
  amount: number;
};

export type ContributionStatus = "pago" | "pendente";

export type Contribution = {
  id: string;
  memberName: string;
  reference: string;
  amount: number;
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

export const INITIAL_MOVEMENTS: Movement[] = [
  {
    id: "m1",
    date: "2026-08-04",
    description: "Mensalidades de agosto",
    category: "Mensalidade",
    type: "entrada",
    amount: 1800,
  },
  {
    id: "m2",
    date: "2026-08-08",
    description: "Doação do Rotary parceiro",
    category: "Doação",
    type: "entrada",
    amount: 500,
  },
  {
    id: "m3",
    date: "2026-08-12",
    description: "Café da manhã do projeto Tamandaré",
    category: "Evento",
    type: "saida",
    amount: 240,
  },
  {
    id: "m4",
    date: "2026-08-18",
    description: "Material gráfico da campanha",
    category: "Material",
    type: "saida",
    amount: 185.5,
  },
  {
    id: "m5",
    date: "2026-08-22",
    description: "Arrecadação do happy hour",
    category: "Evento",
    type: "entrada",
    amount: 320,
  },
  {
    id: "m6",
    date: "2026-07-28",
    description: "Aluguel da sala de reuniões",
    category: "Infraestrutura",
    type: "saida",
    amount: 150,
  },
];

export const INITIAL_CONTRIBUTIONS: Contribution[] = [
  {
    id: "c1",
    memberName: "Ana Souza",
    reference: "Agosto/2026",
    amount: 50,
    status: "pago",
  },
  {
    id: "c2",
    memberName: "Bruno Lima",
    reference: "Agosto/2026",
    amount: 50,
    status: "pago",
  },
  {
    id: "c3",
    memberName: "Carla Mendes",
    reference: "Agosto/2026",
    amount: 50,
    status: "pendente",
  },
  {
    id: "c4",
    memberName: "Diego Martins",
    reference: "Agosto/2026",
    amount: 50,
    status: "pendente",
  },
  {
    id: "c5",
    memberName: "Fernanda Alves",
    reference: "Agosto/2026",
    amount: 50,
    status: "pago",
  },
];
