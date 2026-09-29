"use client";

import {
  CameraIcon,
  ChatCircleDotsIcon,
  EraserIcon,
  PencilIcon,
  SelectionIcon,
} from "@phosphor-icons/react";
import { useRef } from "react";
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

  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const markHint =
    annotateTool === "box"
      ? "Arraste um retângulo sobre o trecho que quer mostrar."
      : annotateTool === "pen"
        ? "Desenhe em cima da imagem para indicar o ponto."
        : "Escolha caixa ou caneta para marcar o ponto na imagem.";

  return (
    <>
      {trigger}

      <Modal
        open={open}
        onClose={handleClose}
        title="Feedback"
        size={screenshot ? "xl" : "lg"}
        description="Conte o que melhorar. Se quiser, mostre o ponto na tela."
        initialFocusRef={descriptionRef}
      >
        <form
          onSubmit={handleSubmit}
          className="flex max-h-[min(78vh,46rem)] flex-col"
        >
          <div className="flex flex-col gap-6 overflow-y-auto px-5 py-5 sm:px-6">
            <section className="flex flex-col gap-2">
              <div>
                <label
                  htmlFor="report-bug-description"
                  className="text-sm font-semibold text-zinc-900"
                >
                  O que melhorar
                </label>
                <p className="mt-1 text-sm text-zinc-500">
                  Uma melhoria ou um problema. Uma frase já ajuda.
                </p>
              </div>
              <textarea
                ref={descriptionRef}
                id="report-bug-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                required
                placeholder="Ex.: o botão de salvar some depois de editar a pauta."
                className="w-full resize-y rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-rotaract-pink/50 focus:bg-white focus:ring-4 focus:ring-rotaract-pink/15"
              />
            </section>

            <section className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">
                    Onde aparece
                    <span className="ml-2 text-xs font-medium text-zinc-400">
                      Opcional
                    </span>
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    Capture a tela e marque o trecho. Este modal fica de fora.
                  </p>
                </div>
                {screenshot ? (
                  <button
                    type="button"
                    onClick={handleCaptureScreenshot}
                    disabled={capturing}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-zinc-600 transition hover:bg-white hover:text-zinc-900 disabled:opacity-50"
                  >
                    <CameraIcon size={16} weight="bold" />
                    {capturing ? "Capturando..." : "Nova captura"}
                  </button>
                ) : null}
              </div>

              {screenshot ? (
                <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                  <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 px-3 py-2.5">
                    <div
                      role="group"
                      aria-label="Ferramentas de marcação"
                      className="inline-flex rounded-full bg-zinc-100 p-1"
                    >
                      <button
                        type="button"
                        aria-pressed={annotateTool === "box"}
                        onClick={() => selectTool("box")}
                        className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition ${
                          annotateTool === "box"
                            ? "bg-white text-rose-700 shadow-sm"
                            : "text-zinc-600 hover:text-zinc-900"
                        }`}
                      >
                        <SelectionIcon size={16} weight="bold" />
                        Caixa
                      </button>
                      <button
                        type="button"
                        aria-pressed={annotateTool === "pen"}
                        onClick={() => selectTool("pen")}
                        className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition ${
                          annotateTool === "pen"
                            ? "bg-white text-rose-700 shadow-sm"
                            : "text-zinc-600 hover:text-zinc-900"
                        }`}
                      >
                        <PencilIcon size={16} weight="bold" />
                        Caneta
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={clearAnnotations}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
                    >
                      <EraserIcon size={16} weight="bold" />
                      Limpar
                    </button>
                    <p className="min-w-[12rem] flex-1 text-xs text-zinc-500 sm:text-right">
                      {markHint}
                    </p>
                  </div>
                  <div className="relative max-h-[42vh] overflow-auto p-3">
                    <div className="relative inline-block max-w-full">
                      <img
                        ref={imageRef}
                        src={screenshot}
                        alt="Print da tela atual"
                        onLoad={syncCanvasSize}
                        className="block max-h-[38vh] max-w-full select-none"
                        draggable={false}
                      />
                      <canvas
                        ref={canvasRef}
                        className={`absolute inset-0 h-full w-full touch-none ${
                          annotateTool ? "cursor-crosshair" : "pointer-events-none"
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
                <button
                  type="button"
                  onClick={handleCaptureScreenshot}
                  disabled={capturing}
                  className="mt-4 flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-zinc-300 bg-white px-4 py-8 text-center transition hover:border-rotaract-pink/40 hover:bg-rotaract-pink/5 disabled:cursor-wait disabled:opacity-70"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-rotaract-pink/10 text-rotaract-pink">
                    <CameraIcon size={20} weight="bold" />
                  </span>
                  <span className="text-sm font-semibold text-zinc-900">
                    {capturing ? "Capturando a tela..." : "Capturar a tela"}
                  </span>
                  <span className="max-w-sm text-xs text-zinc-500">
                    Depois você pode circular ou desenhar o ponto que quer mostrar.
                  </span>
                </button>
              )}
            </section>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-zinc-100 px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-40"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              title={submitting ? "Enviando..." : "Enviar feedback"}
              loading={submitting}
              disabled={submitting}
              className="min-w-36"
            />
          </div>
        </form>
      </Modal>
    </>
  );
}
