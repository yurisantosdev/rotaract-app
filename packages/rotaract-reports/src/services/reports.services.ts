"use client";

import { AlertError, AlertSuccess } from "@rotaract/components";
import { useEffect, useRef, useState } from "react";
import { createReports } from "./database.reports.services";

export type AnnotateTool = "pen" | "box";

export function useReports() {
  const PEN_COLOR = "#e11d48";
  const PEN_WIDTH = 3;
  const BOX_FILL = "rgba(225, 29, 72, 0.18)";
  const BOX_STROKE = "#e11d48";
  const BOX_LINE_WIDTH = 3;

  function isReportBugsUi(element: Element) {
    return Boolean(
      element.closest?.("[data-report-bugs-ui]") ||
      element.classList?.contains("rotaract-modal-backdrop") ||
      element.closest?.(".rotaract-modal-backdrop")
    );
  }

  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [annotateTool, setAnnotateTool] = useState<AnnotateTool | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const boxStartRef = useRef<{ x: number; y: number } | null>(null);
  const canvasSnapshotRef = useRef<ImageData | null>(null);

  function resetForm() {
    setDescription("");
    setScreenshot(null);
    setCapturing(false);
    setAnnotateTool(null);
    setSubmitting(false);
    isDrawingRef.current = false;
    lastPointRef.current = null;
    boxStartRef.current = null;
    canvasSnapshotRef.current = null;
  }

  function handleClose() {
    if (submitting) return;
    resetForm();
    setOpen(false);
  }

  function prepareCanvasContext(ctx: CanvasRenderingContext2D) {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = PEN_COLOR;
    ctx.lineWidth = PEN_WIDTH;
  }

  function syncCanvasSize() {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas) return;

    const width = image.clientWidth;
    const height = image.clientHeight;
    if (!width || !height) return;

    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    prepareCanvasContext(ctx);
  }

  useEffect(() => {
    if (!screenshot) return;

    const frame = window.requestAnimationFrame(() => syncCanvasSize());
    window.addEventListener("resize", syncCanvasSize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", syncCanvasSize);
    };
  }, [screenshot]);

  function getCanvasPoint(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function drawBox(
    ctx: CanvasRenderingContext2D,
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) {
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    if (width < 2 || height < 2) return;

    ctx.fillStyle = BOX_FILL;
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = BOX_STROKE;
    ctx.lineWidth = BOX_LINE_WIDTH;
    ctx.strokeRect(x, y, width, height);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!annotateTool) return;
    const point = getCanvasPoint(event);
    if (!point) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    isDrawingRef.current = true;

    if (annotateTool === "pen") {
      lastPointRef.current = point;
      prepareCanvasContext(ctx);
      ctx.beginPath();
      ctx.fillStyle = PEN_COLOR;
      ctx.arc(point.x, point.y, PEN_WIDTH / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    boxStartRef.current = point;
    canvasSnapshotRef.current = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!annotateTool || !isDrawingRef.current) return;
    const point = getCanvasPoint(event);
    const ctx = canvasRef.current?.getContext("2d");
    if (!point || !ctx) return;

    if (annotateTool === "pen") {
      const last = lastPointRef.current;
      if (!last) return;
      prepareCanvasContext(ctx);
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      lastPointRef.current = point;
      return;
    }

    const start = boxStartRef.current;
    const snapshot = canvasSnapshotRef.current;
    const canvas = canvasRef.current;
    if (!start || !snapshot || !canvas) return;

    ctx.putImageData(snapshot, 0, 0);
    drawBox(ctx, start, point);
  }

  function handlePointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (annotateTool === "box" && isDrawingRef.current) {
      const point = getCanvasPoint(event);
      const start = boxStartRef.current;
      const snapshot = canvasSnapshotRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (point && start && snapshot && canvas && ctx) {
        ctx.putImageData(snapshot, 0, 0);
        drawBox(ctx, start, point);
      }
    }

    isDrawingRef.current = false;
    lastPointRef.current = null;
    boxStartRef.current = null;
    canvasSnapshotRef.current = null;
  }

  function clearAnnotations() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    boxStartRef.current = null;
    canvasSnapshotRef.current = null;
    syncCanvasSize();
  }

  function selectTool(tool: AnnotateTool) {
    setAnnotateTool((current) => (current === tool ? null : tool));
  }

  async function handleCaptureScreenshot() {
    setCapturing(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        logging: false,
        scale: Math.min(window.devicePixelRatio || 1, 2),
        x: window.scrollX,
        y: window.scrollY,
        width: window.innerWidth,
        height: window.innerHeight,
        windowWidth: document.documentElement.clientWidth,
        windowHeight: document.documentElement.clientHeight,
        ignoreElements: (element) => isReportBugsUi(element),
      });
      setScreenshot(canvas.toDataURL("image/png"));
      setAnnotateTool("box");
    } catch (error) {
      console.error("Não foi possível capturar a tela:", error);
    } finally {
      setCapturing(false);
    }
  }

  async function compressScreenshot(dataUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const maxWidth = 1400;
        const scale = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Não foi possível processar a imagem"));
          return;
        }
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL("image/jpeg", 0.7);
        if (!compressed.startsWith("data:image/jpeg;base64,")) {
          reject(new Error("Falha ao gerar base64 da imagem"));
          return;
        }
        resolve(compressed);
      };
      image.onerror = () =>
        reject(new Error("Não foi possível carregar o print para envio"));
      image.src = dataUrl;
    });
  }

  function buildAnnotatedScreenshot(): string | null {
    if (!screenshot) return null;

    if (!imageRef.current || !canvasRef.current) {
      return screenshot;
    }

    const image = imageRef.current;
    const overlay = canvasRef.current;
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    if (!width || !height) return screenshot;

    const merged = document.createElement("canvas");
    merged.width = width;
    merged.height = height;
    const ctx = merged.getContext("2d");
    if (!ctx) return screenshot;

    ctx.drawImage(image, 0, 0, merged.width, merged.height);
    ctx.drawImage(overlay, 0, 0, merged.width, merged.height);
    return merged.toDataURL("image/png");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;

    const trimmed = description.trim();
    if (!trimmed) {
      AlertError("Campo descrição é obrigatório");
      return;
    }

    const controller = new AbortController();
    setSubmitting(true);

    try {
      const rawImage = buildAnnotatedScreenshot();
      const image = rawImage ? await compressScreenshot(rawImage) : undefined;

      await createReports(controller.signal, {
        description: trimmed,
        ...(image ? { image } : {}),
      });
      AlertSuccess("Feedback enviado com sucesso");
      resetForm();
      setOpen(false);
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível enviar o Feedback.";
      AlertError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return {
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
  };
}
