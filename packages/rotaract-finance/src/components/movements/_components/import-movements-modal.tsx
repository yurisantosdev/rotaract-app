"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircleIcon,
  DownloadSimpleIcon,
  MicrosoftExcelLogoIcon,
  UploadSimpleIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { Button, Modal, Pagination, usePagination } from "@rotaract/components";
import { importMovements } from "../../../services/database.movements.services";
import {
  downloadMovementsImportTemplate,
  parseMovementsWorkbook,
} from "../../../services/movementsImport.services";
import type { Movement } from "../../../types/movement";
import type { MovementImportIssue } from "../../../types/movementImport";

type ImportPhase = "idle" | "processing" | "done";

type ImportMovementsModalProps = {
  open: boolean;
  onClose: () => void;
  onImported: (created: Movement[]) => void;
};

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function ImportMovementsModal({
  open,
  onClose,
  onImported,
}: ImportMovementsModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<ImportPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Selecione o arquivo preenchido.");
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [createdCount, setCreatedCount] = useState(0);
  const [issues, setIssues] = useState<MovementImportIssue[]>([]);
  const issuesPagination = usePagination(issues);

  const busy = phase === "processing";

  useEffect(() => {
    if (open) return;
    setPhase("idle");
    setProgress(0);
    setStatus("Selecione o arquivo preenchido.");
    setFileName("");
    setDragging(false);
    setError("");
    setCreatedCount(0);
    setIssues([]);
    if (inputRef.current) inputRef.current.value = "";
  }, [open]);

  function handleClose() {
    if (busy) return;
    onClose();
  }

  async function processFile(file: File) {
    if (busy) return;

    const isExcel =
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls") ||
      file.type.includes("spreadsheet") ||
      file.type.includes("excel");

    if (!isExcel) {
      setError("Envie um arquivo Excel (.xlsx ou .xls).");
      return;
    }

    setError("");
    setIssues([]);
    setCreatedCount(0);
    setFileName(file.name);
    setPhase("processing");
    setProgress(8);
    setStatus("Lendo a planilha...");

    try {
      const buffer = await file.arrayBuffer();
      setProgress(22);
      setStatus("Validando as linhas...");

      const parsed = parseMovementsWorkbook(buffer);
      const parseIssues = parsed.issues;

      if (parsed.rows.length === 0) {
        setPhase("done");
        setProgress(100);
        setCreatedCount(0);
        setIssues(parseIssues);
        setStatus(
          parseIssues[0]?.message ??
          "Nenhuma movimentação válida foi encontrada no arquivo."
        );
        return;
      }

      setProgress(40);
      setStatus(
        `Salvando ${parsed.rows.length} movimentaç${parsed.rows.length === 1 ? "ão" : "ões"}...`
      );

      const controller = new AbortController();
      const result = await importMovements(
        controller.signal,
        parsed.rows,
        (saved, total) => {
          const savingProgress = 40 + (saved / Math.max(total, 1)) * 55;
          setProgress(clampPercent(savingProgress));
          setStatus(`Salvando no banco... ${saved} de ${total}`);
        }
      );

      const allIssues = [...parseIssues, ...result.errors].sort(
        (a, b) => a.row - b.row
      );

      setCreatedCount(result.created.length);
      setIssues(allIssues);
      setProgress(100);
      setPhase("done");
      setStatus(
        result.created.length > 0
          ? `${result.created.length} movimentaç${result.created.length === 1 ? "ão salva" : "ões salvas"} no banco.`
          : "Nenhuma movimentação foi salva."
      );

      if (result.created.length > 0) {
        onImported(result.created);
      }
    } catch (caught) {
      setPhase("idle");
      setProgress(0);
      setStatus("Selecione o arquivo preenchido.");
      setError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível processar a planilha."
      );
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    void processFile(file);
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      eyebrow="Tesouraria"
      title="Importar movimentações"
      description="Baixe o modelo, preencha as linhas e envie a planilha para registrar várias entradas e saídas de uma vez."
    >
      <div className="flex max-h-[min(72vh,40rem)] flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <ol className="space-y-2 text-sm text-zinc-600">
            <li>1. Baixe o modelo de Excel com as colunas certas.</li>
            <li>2. Substitua as linhas de exemplo pelos dados do clube.</li>
            <li>3. Envie o arquivo para validarmos e salvarmos no banco.</li>
          </ol>

          <button
            type="button"
            disabled={busy}
            onClick={() => downloadMovementsImportTemplate()}
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <DownloadSimpleIcon className="h-5 w-5" weight="bold" />
            Baixar modelo de Excel
          </button>

          {phase === "processing" || phase === "done" ? (
            <div className="mt-5 rounded-[1.35rem] border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-zinc-800">{status}</p>
                <p className="text-2xl font-semibold tabular-nums text-zinc-900">
                  {progress}%
                </p>
              </div>
              <div
                className="mt-3 h-3 overflow-hidden rounded-full bg-zinc-200"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                aria-label="Progresso da importação"
              >
                <div
                  className="h-full rounded-full bg-rotaract-pink transition-[width] duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {fileName ? (
                <p className="mt-3 truncate text-xs text-zinc-500">{fileName}</p>
              ) : null}
            </div>
          ) : (
            <label
              htmlFor="movements-import-file"
              onDragEnter={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setDragging(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                handleFiles(event.dataTransfer.files);
              }}
              className={`mt-5 flex cursor-pointer flex-col items-center justify-center rounded-[1.35rem] border border-dashed px-4 py-8 text-center transition ${dragging
                ? "border-rotaract-pink bg-rotaract-pink/5"
                : "border-zinc-300 bg-zinc-50 hover:border-zinc-400 hover:bg-white"
                }`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                <MicrosoftExcelLogoIcon className="h-6 w-6" weight="duotone" />
              </span>
              <span className="mt-3 text-sm font-semibold text-zinc-900">
                Arraste o Excel ou clique para enviar
              </span>
              <span className="mt-1 text-xs text-zinc-500">
                Arquivos .xlsx ou .xls, até 2500 linhas
              </span>
            </label>
          )}

          <input
            id="movements-import-file"
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="sr-only"
            disabled={busy}
            onChange={(event) => handleFiles(event.target.files)}
          />

          {phase === "done" ? (
            <div className="mt-4 space-y-3">
              <p
                className={`flex items-start gap-2 rounded-2xl px-3.5 py-2.5 text-sm ${createdCount > 0
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-zinc-100 text-zinc-600"
                  }`}
              >
                {createdCount > 0 ? (
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0" weight="fill" />
                ) : (
                  <WarningCircleIcon className="mt-0.5 h-4 w-4 shrink-0" weight="fill" />
                )}
                {createdCount > 0
                  ? `${createdCount} movimentaç${createdCount === 1 ? "ão foi salva" : "ões foram salvas"} com sucesso.`
                  : "Nenhuma linha válida foi importada."}
              </p>

              {issues.length > 0 ? (
                <div className="rounded-2xl bg-rose-50 px-3.5 py-3">
                  <p className="text-sm font-medium text-rose-700">
                    {issues.length} linha{issues.length === 1 ? "" : "s"} com problema
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-rose-600">
                    {issuesPagination.pageItems.map((item) => (
                      <li key={`${item.row}-${item.message}`}>
                        {item.row > 1 ? `Linha ${item.row}: ` : null}
                        {item.message}
                      </li>
                    ))}
                  </ul>
                  <Pagination
                    page={issuesPagination.page}
                    totalItems={issuesPagination.totalItems}
                    pageSize={issuesPagination.pageSize}
                    onPageChange={issuesPagination.setPage}
                    itemLabel={{ singular: "linha", plural: "linhas" }}
                    compact
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <p
              className="mt-4 rounded-2xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600"
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={busy}
            className="h-12 rounded-full px-5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {phase === "done" ? "Fechar" : "Cancelar"}
          </button>

          {phase === "done" ? (
            <Button
              title="Enviar outro arquivo"
              icon={<UploadSimpleIcon className="h-4 w-4" weight="bold" />}
              onClick={() => {
                setPhase("idle");
                setProgress(0);
                setStatus("Selecione o arquivo preenchido.");
                setFileName("");
                setError("");
                setCreatedCount(0);
                setIssues([]);
              }}
            />
          ) : (
            <Button
              title={busy ? "Processando..." : "Selecionar arquivo"}
              icon={<UploadSimpleIcon className="h-4 w-4" weight="bold" />}
              loading={busy}
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
