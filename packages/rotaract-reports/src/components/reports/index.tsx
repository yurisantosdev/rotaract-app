"use client";

import {
  CameraIcon,
  ChatCircleDotsIcon,
  EraserIcon,
  PencilIcon,
  SelectionIcon,
} from "@phosphor-icons/react";
import { createPortal } from "react-dom";
import { Button, Modal } from "@rotaract/components";
import { useReports } from "../../services/reports.services";

export function Reports() {
  const data = useReports();
  if (!data) return null;
  const {
    open,
    setOpen,
    handleClose,
    screenshot,
    handleSubmit,
    description,
    setDescription,
    capturing,
    submitting,
    handleCaptureScreenshot,
    annotateTool,
    selectTool,
    clearAnnotations,
    imageRef,
    syncCanvasSize,
    canvasRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  } = data;

  const trigger =
    typeof document !== "undefined"
      ? createPortal(
        <div
          data-report-bugs-ui
          className="fixed bottom-4 right-4 z-50 w-max cursor-pointer border border-yellow-400 rounded-full p-2 bg-yellow-200 shadow-[0_12px_40px_rgba(24,24,27,0.04)] hover:bg-yellow-300 transition-colors hover:scale-110"
          onClick={() => setOpen(true)}
        >
          <ChatCircleDotsIcon size={32} color="#000" />
        </div>,
        document.body
      )
      : null;

  const toolButtonClass = (active: boolean) =>
    `inline-flex h-11 items-center justify-center gap-1.5 rounded-2xl border px-4 text-sm font-semibold transition ${active
      ? "border-rose-300 bg-rose-50 text-rose-700"
      : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
    }`;

  return (
    <>
      {trigger}

      <Modal
        open={open}
        onClose={handleClose}
        title="Reportar Feedback"
        size={screenshot ? "xl" : "lg"}
        description="Relate um Feedback que você encontrou no sistema."
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4 sm:p-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="report-bug-description"
              className="text-sm font-medium text-zinc-800"
            >
              Descrição do bug
            </label>
            <textarea
              id="report-bug-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              required
              placeholder="Descreva o que aconteceu, o que você esperava e os passos para reproduzir..."
              className="w-full resize-y rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-rotaract-pink/40 focus:ring-4 focus:ring-rotaract-pink/15"
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                title={capturing ? "Capturando..." : "Tirar print da tela"}
                icon={<CameraIcon size={18} weight="bold" />}
                loading={capturing}
                onClick={handleCaptureScreenshot}
                className="!rounded-2xl"
              />

              {screenshot ? (
                <>
                  <button
                    type="button"
                    onClick={() => selectTool("box")}
                    className={toolButtonClass(annotateTool === "box")}
                  >
                    <SelectionIcon size={16} weight="bold" />
                    {annotateTool === "box" ? "Caixa ativa" : "Caixa"}
                  </button>
                  <button
                    type="button"
                    onClick={() => selectTool("pen")}
                    className={toolButtonClass(annotateTool === "pen")}
                  >
                    <PencilIcon size={16} weight="bold" />
                    {annotateTool === "pen" ? "Caneta ativa" : "Caneta"}
                  </button>
                  <button
                    type="button"
                    onClick={clearAnnotations}
                    className="inline-flex h-11 items-center justify-center gap-1.5 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                  >
                    <EraserIcon size={16} weight="bold" />
                    Limpar marcações
                  </button>
                </>
              ) : null}
            </div>

            {screenshot ? (
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
                <p className="border-b border-zinc-200 px-4 py-2 text-xs text-zinc-500">
                  {annotateTool === "box"
                    ? "Arraste uma caixa vermelha sobre a área do bug."
                    : annotateTool === "pen"
                      ? "Desenhe com a caneta o local do bug no print."
                      : "Escolha Caixa ou Caneta para destacar o problema."}
                </p>
                <div className="relative max-h-[50vh] overflow-auto p-3">
                  <div className="relative inline-block max-w-full">
                    <img
                      ref={imageRef}
                      src={screenshot}
                      alt="Print da tela atual"
                      onLoad={syncCanvasSize}
                      className="block max-h-[46vh] max-w-full select-none"
                      draggable={false}
                    />
                    <canvas
                      ref={canvasRef}
                      className={`absolute inset-0 h-full w-full touch-none ${annotateTool ? "cursor-crosshair" : "pointer-events-none"
                        }`}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500">
                O print captura a tela atual sem incluir este modal.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-zinc-100 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-40"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              title={submitting ? "Enviando..." : "Enviar"}
              loading={submitting}
              disabled={submitting}
              className="min-w-28"
            />
          </div>
        </form>
      </Modal>
    </>
  );
}
