import type { Member } from "@rotaract/members";
import type { Pauta, PautaPayload } from "../../types/pautas";

export type PautasPanelProps = {
  pautas: Pauta[];
  members: Member[];
  currentUserId?: string;
  onOpen: (pautaId: string) => void;
  onCreate: (payload: PautaPayload) => void | Promise<void>;
};
