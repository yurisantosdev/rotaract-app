import type { Member } from "@rotaract/members";
import {
  isOpenPautaItem,
  type PautaItem,
  type PautaItemPayload,
} from "./pautaItems";

export const PAUTA_STATUS = [
  "rascunho",
  "agendada",
  "realizada",
  "cancelada",
] as const;

export type PautaStatus = (typeof PAUTA_STATUS)[number];

export const PAUTA_TYPES = ["ordinaria", "extraordinaria", "diretoria"] as const;

export type PautaType = (typeof PAUTA_TYPES)[number];

export type PautaFilter = "todos" | PautaStatus | "sem_pdf";

export type Pauta = {
  id: string;
  title: string;
  meetingDate: string;
  type: PautaType;
  status: PautaStatus;
  notes: string;
  presentMemberIds: string[];
  items: PautaItem[];
  calendarEventId: string | null;
  generatedAt: string | null;
  management: string;
  createdAt: string;
  updatedAt: string;
};

export type PautaPayload = {
  title: string;
  meetingDate: string;
  type: PautaType;
  status: PautaStatus;
  notes: string;
  presentMemberIds: string[];
  calendarEventId?: string | null;
};

export const PAUTA_FILTERS: { id: PautaFilter; label: string }[] = [
  { id: "todos", label: "Todas" },
  { id: "rascunho", label: "Rascunho" },
  { id: "agendada", label: "Agendadas" },
  { id: "realizada", label: "Realizadas" },
  { id: "cancelada", label: "Canceladas" },
  { id: "sem_pdf", label: "Sem PDF" },
];

export const PAUTA_STATUS_OPTIONS: { id: PautaStatus; label: string }[] = [
  { id: "rascunho", label: "Rascunho" },
  { id: "agendada", label: "Agendada" },
  { id: "realizada", label: "Realizada" },
  { id: "cancelada", label: "Cancelada" },
];

export const PAUTA_TYPE_OPTIONS: { id: PautaType; label: string }[] = [
  { id: "ordinaria", label: "Ordinária" },
  { id: "extraordinaria", label: "Extraordinária" },
  { id: "diretoria", label: "Diretoria" },
];

export const PAUTA_STATUS_LABELS: Record<PautaStatus, string> = {
  rascunho: "Rascunho",
  agendada: "Agendada",
  realizada: "Realizada",
  cancelada: "Cancelada",
};

export const PAUTA_TYPE_LABELS: Record<PautaType, string> = {
  ordinaria: "Reunião ordinária",
  extraordinaria: "Reunião extraordinária",
  diretoria: "Reunião de diretoria",
};

export const PAUTA_STATUS_STYLES: Record<PautaStatus, string> = {
  rascunho: "bg-zinc-100 text-zinc-600",
  agendada: "bg-rotaract-pink/10 text-rotaract-pink",
  realizada: "bg-emerald-50 text-emerald-700",
  cancelada: "bg-rose-50 text-rose-700",
};

export const PAUTA_INPUT_CLASS =
  "h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-900 outline-none ring-rotaract-pink/20 transition placeholder:text-zinc-400 focus:border-rotaract-pink/50 focus:bg-white focus:ring-4";

export const PAUTA_TEXTAREA_CLASS =
  "min-h-[6rem] w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none ring-rotaract-pink/20 transition placeholder:text-zinc-400 focus:border-rotaract-pink/50 focus:bg-white focus:ring-4";

export function pautaStatusLabel(status: PautaStatus): string {
  return PAUTA_STATUS_LABELS[status];
}

export function pautaTypeLabel(type: PautaType): string {
  return PAUTA_TYPE_LABELS[type];
}

export function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function uniqueIds(ids: string[]): string[] {
  return Array.from(new Set(ids.filter(Boolean)));
}

export function matchesPautaFilter(pauta: Pauta, filter: PautaFilter): boolean {
  if (filter === "todos") return true;
  if (filter === "sem_pdf") return !pauta.generatedAt;
  return pauta.status === filter;
}

export function getPautaItemProgress(items: PautaItem[]): {
  total: number;
  resolved: number;
  open: number;
  percent: number;
} {
  const total = items.length;
  const resolved = items.filter((item) => item.status === "resolvido").length;
  const open = items.filter((item) => isOpenPautaItem(item.status)).length;
  return {
    total,
    resolved,
    open,
    percent: total === 0 ? 0 : Math.round((resolved / total) * 100),
  };
}

export function clonePauta(pauta: Pauta): Pauta {
  return {
    ...pauta,
    presentMemberIds: [...pauta.presentMemberIds],
    items: pauta.items.map((item) => ({ ...item })),
  };
}

export function defaultPautaTitle(type: PautaType, meetingDate: string): string {
  const date = new Date(`${meetingDate}T00:00:00`);
  const formatted = Number.isNaN(date.getTime())
    ? meetingDate
    : date.toLocaleDateString("pt-BR");
  return `${pautaTypeLabel(type)} — ${formatted}`;
}

export function pautaFileName(pauta: Pauta): string {
  const base =
    pauta.title
      .trim()
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, " ")
      .replace(/-+/g, "-")
      .slice(0, 120)
      .trim() || "pauta";
  return `${base}.pdf`;
}

export type PautaDetailProps = {
  pauta: Pauta;
  members: Member[];
  onUpdatePauta: (payload: PautaPayload) => void | Promise<void>;
  onRemovePauta: () => void | Promise<void>;
  onDuplicatePauta: () => void | Promise<void>;
  onCreateItem: (payload: PautaItemPayload) => void | Promise<void>;
  onUpdateItem: (itemId: string, payload: PautaItemPayload) => void | Promise<void>;
  onChangeItemStatus: (
    itemId: string,
    status: PautaItem["status"]
  ) => void | Promise<void>;
  onRemoveItem: (itemId: string) => void | Promise<void>;
  onMoveItem: (itemId: string, direction: "up" | "down") => void | Promise<void>;
  onImportPendingItems: () => void | Promise<void>;
  canImportPendingItems: boolean;
  onGeneratePdf: () => void | Promise<void>;
  onDownloadPdf: () => void | Promise<void>;
  generatingPdf: boolean;
  downloadingPdf: boolean;
};

export type PautasPageProps = {
  userName: string;
  currentUserId?: string;
  backHref?: string;
};
