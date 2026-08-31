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

export const MOVEMENT_CATEGORIES = [
  "Mensalidade",
  "Evento",
  "Doação",
  "Material",
  "Infraestrutura",
  "Outros",
] as const;
