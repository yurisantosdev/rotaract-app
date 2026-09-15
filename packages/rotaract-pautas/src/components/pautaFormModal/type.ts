import type { Member } from "@rotaract/members";
import type { Pauta, PautaPayload } from "../../types/pautas";

export type PautaFormModalProps = {
  open: boolean;
  pauta: Pauta | null;
  members: Member[];
  currentUserId?: string;
  onClose: () => void;
  onSave: (payload: PautaPayload) => void | Promise<void>;
};
