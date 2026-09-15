import type { Member } from "@rotaract/members";
import type { PautaItem, PautaItemPayload } from "../../types/pautaItems";

export type PautaItemFormModalProps = {
  open: boolean;
  item: PautaItem | null;
  members: Member[];
  defaultResponsibleId?: string;
  onClose: () => void;
  onSave: (payload: PautaItemPayload) => void | Promise<void>;
};
