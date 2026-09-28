"use client";

import {
  ListBulletsIcon,
  ListNumbersIcon,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextBIcon,
  TextHIcon,
  TextItalicIcon,
  TextTIcon,
  TextUnderlineIcon,
} from "@phosphor-icons/react";
import { Button, Modal } from "@rotaract/components";
import { type ReactNode } from "react";
import { PautaDocumentModalProps } from "./types";
import { usePautaDocumentModal } from "./services";

export function PautaDocumentModal({
  open,
  pauta,
  members,
  club,
  onClose,
  onSave,
}: PautaDocumentModalProps) {
  const data = usePautaDocumentModal({
    open,
    pauta,
    members,
    club,
    onClose,
    onSave,
  });
  const {
    marks,
    editorRef,
    initialHtml,
    draftKey,
    confirmReset,
    error,
    saving,
    handleSave,
    loadGenerated,
    requestReset,
    runCommand,
    formatBlock,
    setEdited,
    setConfirmReset
  } = data;

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Documento"
      title="Editar documento"
      description="Formate o texto da pauta. O PDF usa esta versão depois que você salvar e gerar de novo."
      size="xl"
    >
      <div className="border-b border-zinc-100 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-1">
          <ToolButton
            label="Negrito"
            active={marks.bold}
            onClick={() => runCommand(editorRef.current, "bold")}
          >
            <TextBIcon className="h-4 w-4" />
          </ToolButton>
          <ToolButton
            label="Itálico"
            active={marks.italic}
            onClick={() => runCommand(editorRef.current, "italic")}
          >
            <TextItalicIcon className="h-4 w-4" />
          </ToolButton>
          <ToolButton
            label="Sublinhado"
            active={marks.underline}
            onClick={() => runCommand(editorRef.current, "underline")}
          >
            <TextUnderlineIcon className="h-4 w-4" />
          </ToolButton>
          <span className="mx-1 hidden h-6 w-px bg-zinc-200 sm:block" />
          <ToolButton
            label="Título"
            onClick={() => formatBlock(editorRef.current, "h2")}
          >
            <TextHIcon className="h-4 w-4" />
            <span className="text-xs font-semibold">Título</span>
          </ToolButton>
          <ToolButton
            label="Subtítulo"
            onClick={() => formatBlock(editorRef.current, "h3")}
          >
            <span className="text-xs font-semibold">Subtítulo</span>
          </ToolButton>
          <ToolButton
            label="Texto maior"
            onClick={() => runCommand(editorRef.current, "fontSize", "5")}
          >
            <TextTIcon className="h-5 w-5" />
          </ToolButton>
          <ToolButton
            label="Texto normal"
            onClick={() => runCommand(editorRef.current, "fontSize", "3")}
          >
            <TextTIcon className="h-3.5 w-3.5" />
          </ToolButton>
          <span className="mx-1 hidden h-6 w-px bg-zinc-200 sm:block" />
          <ToolButton
            label="Lista"
            onClick={() => runCommand(editorRef.current, "insertUnorderedList")}
          >
            <ListBulletsIcon className="h-4 w-4" />
          </ToolButton>
          <ToolButton
            label="Lista numerada"
            onClick={() => runCommand(editorRef.current, "insertOrderedList")}
          >
            <ListNumbersIcon className="h-4 w-4" />
          </ToolButton>
          <ToolButton
            label="Alinhar à esquerda"
            onClick={() => runCommand(editorRef.current, "justifyLeft")}
          >
            <TextAlignLeftIcon className="h-4 w-4" />
          </ToolButton>
          <ToolButton
            label="Centralizar"
            onClick={() => runCommand(editorRef.current, "justifyCenter")}
          >
            <TextAlignCenterIcon className="h-4 w-4" />
          </ToolButton>
        </div>
      </div>

      <div className="max-h-[min(68vh,44rem)] overflow-y-auto bg-zinc-100 px-4 py-5 sm:px-6">
        <style>{`
          .pauta-doc h2 { font-size: 20px; font-weight: 700; margin: 12px 0 6px; }
          .pauta-doc h3 { font-size: 14px; font-weight: 700; margin: 10px 0 6px; }
          .pauta-doc p { margin: 6px 0; }
          .pauta-doc ul { margin: 8px 0; padding-left: 1.25rem; list-style: disc; }
          .pauta-doc ol { margin: 8px 0; padding-left: 1.25rem; list-style: decimal; }
          .pauta-doc font[size="5"], .pauta-doc font[size="6"] { font-size: 20px; }
          .pauta-doc font[size="7"] { font-size: 32px; }
          .pauta-doc font[size="3"] { font-size: 14px; }
        `}</style>
        <div
          key={draftKey}
          ref={editorRef}
          className="pauta-doc mx-auto min-h-[36rem] w-full max-w-[720px] rounded-2xl bg-white px-8 py-9 text-sm leading-relaxed text-zinc-900 shadow-[0_12px_40px_rgba(24,24,27,0.06)] outline-none sm:px-10"
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-label="Documento da pauta"
          lang="pt-BR"
          spellCheck
          suppressContentEditableWarning
          onInput={() => setEdited(true)}
          dangerouslySetInnerHTML={{ __html: initialHtml }}
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-zinc-100 px-4 py-4 sm:px-6">
        {confirmReset ? (
          <p className="text-sm text-zinc-600">
            Substituir o texto editado pelos dados atuais da pauta?
          </p>
        ) : (
          <p className="text-sm text-zinc-500">
            Se presentes ou itens mudarem depois, atualize o documento com os dados atuais.
          </p>
        )}
        {error ? (
          <p className="text-sm text-rose-700" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center justify-end gap-2">
          {confirmReset ? (
            <>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={loadGenerated}
                className="inline-flex h-11 items-center rounded-full bg-zinc-900 px-4 text-sm font-semibold text-white transition hover:bg-zinc-700"
              >
                Substituir texto
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={requestReset}
                className="mr-auto inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100"
              >
                Atualizar com os dados atuais
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100"
              >
                Fechar
              </button>
              <Button title="Salvar documento" loading={saving} onClick={handleSave} />
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

function ToolButton({
  label,
  active = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(event) => {
        event.preventDefault();
      }}
      onClick={onClick}
      className={`inline-flex h-9 items-center justify-center gap-1 rounded-xl px-2.5 transition ${active
        ? "bg-rotaract-pink/10 text-rotaract-pink"
        : "text-zinc-600 hover:bg-zinc-100"
        }`}
    >
      {children}
    </button>
  );
}
