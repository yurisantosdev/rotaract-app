export const PAUTA_ITEM_STATUS = [
  "pendente",
  "adiado",
  "resolvido",
] as const;

export type PautaItemStatus = (typeof PAUTA_ITEM_STATUS)[number];

export type PautaItemFilter = "todos" | PautaItemStatus;

export type PautaItem = {
  id: string;
  title: string;
  description: string;
  responsibleId: string;
  status: PautaItemStatus;
  order: number;
};

export type PautaItemPayload = {
  title: string;
  description: string;
  responsibleId: string;
  status: PautaItemStatus;
};

export const PAUTA_ITEM_FILTERS: { id: PautaItemFilter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "pendente", label: "Pendentes" },
  { id: "adiado", label: "Adiados" },
  { id: "resolvido", label: "Resolvidos" },
];

export const PAUTA_ITEM_STATUS_OPTIONS: {
  id: PautaItemStatus;
  label: string;
}[] = [
  { id: "pendente", label: "Pendente" },
  { id: "adiado", label: "Adiado" },
  { id: "resolvido", label: "Resolvido" },
];

export const PAUTA_ITEM_STATUS_STYLES: Record<
  PautaItemStatus,
  { chip: string; selected: string }
> = {
  pendente: {
    chip: "bg-white text-amber-500 ring-amber-200",
    selected: "bg-amber-500 text-white ring-2 ring-amber-600 shadow-sm",
  },
  adiado: {
    chip: "bg-white text-zinc-500 ring-zinc-200",
    selected: "bg-zinc-700 text-white ring-2 ring-zinc-900 shadow-sm",
  },
  resolvido: {
    chip: "bg-white text-emerald-500 ring-emerald-200",
    selected: "bg-emerald-500 text-white ring-2 ring-emerald-600 shadow-sm",
  },
};

export function pautaItemStatusLabel(status: PautaItemStatus): string {
  return (
    PAUTA_ITEM_STATUS_OPTIONS.find((item) => item.id === status)?.label ?? status
  );
}

export function isOpenPautaItem(status: PautaItemStatus): boolean {
  return status === "pendente" || status === "adiado";
}

export function sortPautaItems(items: PautaItem[]): PautaItem[] {
  return [...items].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "pt-BR"));
}
