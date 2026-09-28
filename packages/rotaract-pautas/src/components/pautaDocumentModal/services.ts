"use client";

import { buildPautaInnerHtml } from "../../lib/pdf";
import { documentHasVisibleContent, sanitizeDocumentHtml } from "../../lib/sanitizeDocumentHtml";
import { AlertError, AlertSuccess } from "@rotaract/components";
import { useEffect, useMemo, useRef, useState } from "react";
import { Marks, PautaDocumentModalProps } from "./types";

export function usePautaDocumentModal({
  open,
  pauta,
  members,
  club,
  onClose,
  onSave
}: PautaDocumentModalProps) {
  const MAX_DOCUMENT_HTML = 2_000_000;

  function focusEditor(editor: HTMLDivElement | null) {
    editor?.focus();
  }

  function runCommand(editor: HTMLDivElement | null, command: string, value?: string) {
    focusEditor(editor);
    document.execCommand(command, false, value);
  }

  function formatBlock(editor: HTMLDivElement | null, tag: string) {
    focusEditor(editor);
    const applied = document.execCommand("formatBlock", false, tag);
    if (!applied) {
      document.execCommand("formatBlock", false, `<${tag}>`);
    }
  }

  const editorRef = useRef<HTMLDivElement>(null);
  const generated = useMemo(
    () => buildPautaInnerHtml(pauta, members, club),
    [pauta, members, club]
  );
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [draftKey, setDraftKey] = useState(0);
  const [initialHtml, setInitialHtml] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [edited, setEdited] = useState(false);
  const [marks, setMarks] = useState<Marks>({
    bold: false,
    italic: false,
    underline: false,
  });

  if (open && sessionId !== pauta.id) {
    const saved = pauta.documentHtml.trim();
    setSessionId(pauta.id);
    setInitialHtml(saved ? sanitizeDocumentHtml(saved) : generated);
    setDraftKey((key) => key + 1);
    setError("");
    setConfirmReset(false);
    setEdited(false);
  }

  if (!open && sessionId !== null) {
    setSessionId(null);
  }

  useEffect(() => {
    if (!open) return;

    function updateMarks() {
      setMarks({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
      });
    }

    document.addEventListener("selectionchange", updateMarks);
    return () => document.removeEventListener("selectionchange", updateMarks);
  }, [open]);

  function loadGenerated() {
    setInitialHtml(generated);
    setDraftKey((key) => key + 1);
    setConfirmReset(false);
    setEdited(false);
    setError("");
  }

  function requestReset() {
    if (edited) {
      setConfirmReset(true);
      return;
    }
    loadGenerated();
  }

  async function handleSave() {
    if (saving) return;
    const raw = editorRef.current?.innerHTML ?? "";
    const clean = sanitizeDocumentHtml(raw);
    if (clean.length > MAX_DOCUMENT_HTML) {
      setError("O documento passou do tamanho permitido.");
      return;
    }

    const html = documentHasVisibleContent(clean) ? clean : "";
    setSaving(true);
    setError("");

    try {
      await onSave(html);
      AlertSuccess(
        html
          ? "Documento salvo. Gere o PDF de novo para baixar esta versão."
          : "Documento voltou ao texto automático da pauta."
      );
      onClose();
    } catch (caught) {
      AlertError("Não foi possível salvar o documento.");
      setError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível salvar o documento."
      );
    } finally {
      setSaving(false);
    }
  }

  return {
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
  };
}
