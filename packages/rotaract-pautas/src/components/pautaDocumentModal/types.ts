import { PautaClubInfo } from "../../lib/pdf";
import { Pauta } from "../../types/pautas";
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