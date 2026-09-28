import { PautaClubInfo } from "@/src/lib/pdf";
import { Pauta } from "@/src/types/pautas";
import { Member } from "@rotaract/members";

export type PautaDocumentModalProps = {
  open: boolean;
  pauta: Pauta;
  members: Member[];
  club: PautaClubInfo;
  onClose: () => void;
  onSave: (documentHtml: string) => void | Promise<void>;
};

export type Marks = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
};