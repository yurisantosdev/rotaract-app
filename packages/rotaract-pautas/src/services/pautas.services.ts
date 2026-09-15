"use client";

import { AlertError, AlertSuccess, AlertWarn } from "@rotaract/components";
import { useMembers, useMembersStatus } from "@rotaract/members";
import { listSettings, useViewingManagement } from "@rotaract/settings";
import { useEffect, useRef, useState } from "react";
import type { Pauta, PautaPayload } from "../types/pautas";
import { pautaFileName } from "../types/pautas";
import type { PautaItemPayload, PautaItemStatus } from "../types/pautaItems";
import { downloadBlob, generatePautaPdfBlob, type PautaClubInfo } from "../lib/pdf";
import {
  createPauta,
  createPautaItem,
  duplicatePauta,
  importPendingItems,
  lastRealizedPauta,
  listPautas,
  markPautaGenerated,
  movePautaItem,
  removePauta,
  removePautaItem,
  updatePauta,
  updatePautaItem,
} from "./database.pautas.services";

export function usePautas(userName: string) {
  const members = useMembers();
  const membersStatus = useMembersStatus();
  const { viewingManagement, viewingOptions } = useViewingManagement();
  const firstName = userName.split(" ")[0] || userName;
  const [pautas, setPautas] = useState<Pauta[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");
  const [isLoadingPautas, setIsLoadingPautas] = useState(true);
  const [club, setClub] = useState<PautaClubInfo>({ clubName: "Rotaract Club" });
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const pdfCache = useRef(new Map<string, Blob>());

  const isLoading =
    isLoadingPautas ||
    membersStatus === "idle" ||
    membersStatus === "loading";
  const selected = pautas.find((pauta) => pauta.id === selectedId) ?? null;
  const pendingSource = lastRealizedPauta(pautas, selected?.id);

  useEffect(() => {
    setSelectedId(null);
  }, [viewingManagement]);

  useEffect(() => {
    const controller = new AbortController();

    void listSettings(controller.signal)
      .then((settings) => {
        const current = settings[0];
        if (!current) return;
        setClub({
          clubName: current.nameClub.trim() || "Rotaract Club",
          logoUrl: current.logo || undefined,
        });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setClub({ clubName: "Rotaract Club" });
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!viewingManagement) {
      const waitingForViewing =
        membersStatus === "idle" ||
        membersStatus === "loading" ||
        viewingOptions.length > 0;

      if (waitingForViewing) {
        setIsLoadingPautas(true);
        return;
      }

      setPautas([]);
      setLoadError("");
      setIsLoadingPautas(false);
      return;
    }

    const controller = new AbortController();
    setIsLoadingPautas(true);

    void listPautas(controller.signal, viewingManagement)
      .then((list) => {
        if (controller.signal.aborted) return;
        setPautas(list);
        setLoadError("");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setPautas([]);
        setLoadError("Não foi possível carregar as pautas.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingPautas(false);
        }
      });

    return () => controller.abort();
  }, [membersStatus, viewingManagement, viewingOptions.length]);

  function replacePauta(updated: Pauta) {
    setPautas((current) =>
      current.map((pauta) => (pauta.id === updated.id ? updated : pauta))
    );
    pdfCache.current.delete(updated.id);
    setLoadError("");
  }

  function handleCreatePauta(payload: PautaPayload) {
    const controller = new AbortController();

    return createPauta(controller.signal, payload).then((created) => {
      if (created.management === viewingManagement) {
        setPautas((current) => [created, ...current]);
        setSelectedId(created.id);
      }
      setLoadError("");
    });
  }

  function handleUpdatePauta(payload: PautaPayload) {
    if (!selected) return Promise.resolve();
    const controller = new AbortController();

    return updatePauta(selected.id, controller.signal, payload).then(replacePauta);
  }

  function handleRemovePauta() {
    if (!selected) return Promise.resolve();
    const pautaId = selected.id;
    const controller = new AbortController();

    return removePauta(pautaId, controller.signal)
      .then(() => {
        setPautas((current) => current.filter((pauta) => pauta.id !== pautaId));
        pdfCache.current.delete(pautaId);
        setSelectedId(null);
        AlertSuccess("Pauta excluída com sucesso");
        setLoadError("");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        AlertError("Não foi possível excluir a pauta.");
        setLoadError(
          error instanceof Error
            ? error.message
            : "Não foi possível excluir a pauta."
        );
      });
  }

  function handleDuplicatePauta() {
    if (!selected) return Promise.resolve();
    const controller = new AbortController();

    return duplicatePauta(selected.id, controller.signal)
      .then((created) => {
        if (created.management === viewingManagement) {
          setPautas((current) => [created, ...current]);
          setSelectedId(created.id);
        }
        AlertSuccess("Pauta duplicada como rascunho");
        setLoadError("");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        AlertError("Não foi possível duplicar a pauta.");
      });
  }

  function handleCreateItem(payload: PautaItemPayload) {
    if (!selected) return Promise.resolve();
    const controller = new AbortController();

    return createPautaItem(selected.id, controller.signal, payload).then(
      replacePauta
    );
  }

  function handleUpdateItem(itemId: string, payload: PautaItemPayload) {
    if (!selected) return Promise.resolve();
    const controller = new AbortController();

    return updatePautaItem(
      selected.id,
      itemId,
      controller.signal,
      payload
    ).then(replacePauta);
  }

  function handleChangeItemStatus(itemId: string, status: PautaItemStatus) {
    if (!selected) return Promise.resolve();
    const current = selected.items.find((item) => item.id === itemId);
    if (!current || current.status === status) return Promise.resolve();

    const controller = new AbortController();

    return updatePautaItem(selected.id, itemId, controller.signal, {
      title: current.title,
      description: current.description,
      responsibleId: current.responsibleId,
      status,
    }).then(replacePauta);
  }

  function handleRemoveItem(itemId: string) {
    if (!selected) return Promise.resolve();
    const controller = new AbortController();

    return removePautaItem(selected.id, itemId, controller.signal)
      .then((updated) => {
        replacePauta(updated);
        AlertSuccess("Item excluído com sucesso");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        AlertError("Não foi possível excluir o item.");
      });
  }

  function handleMoveItem(itemId: string, direction: "up" | "down") {
    if (!selected) return Promise.resolve();
    const controller = new AbortController();

    return movePautaItem(
      selected.id,
      itemId,
      controller.signal,
      direction
    ).then(replacePauta);
  }

  function handleImportPendingItems() {
    if (!selected || !pendingSource) return Promise.resolve();
    const controller = new AbortController();
    const previousCount = selected.items.length;

    return importPendingItems(selected.id, controller.signal, pendingSource.id)
      .then((updated) => {
        if (updated.items.length === previousCount) {
          AlertWarn("Não havia pendências novas para importar.");
          return;
        }
        replacePauta(updated);
        AlertSuccess("Pendências da última reunião importadas");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        AlertError("Não foi possível importar as pendências.");
      });
  }

  async function handleGeneratePdf() {
    if (!selected || generatingPdf) return;

    setGeneratingPdf(true);
    const controller = new AbortController();

    try {
      const blob = await generatePautaPdfBlob(selected, members, club);
      const updated = await markPautaGenerated(selected.id, controller.signal);
      pdfCache.current.set(updated.id, blob);
      setPautas((current) =>
        current.map((pauta) => (pauta.id === updated.id ? updated : pauta))
      );
      AlertSuccess("Pauta gerada em PDF");
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      AlertError("Não foi possível gerar o PDF da pauta.");
      setLoadError(
        error instanceof Error
          ? error.message
          : "Não foi possível gerar o PDF da pauta."
      );
    } finally {
      setGeneratingPdf(false);
    }
  }

  async function handleDownloadPdf() {
    if (!selected || downloadingPdf) return;
    if (!selected.generatedAt) {
      AlertWarn("Gere a pauta antes de baixar o PDF.");
      return;
    }

    setDownloadingPdf(true);
    try {
      let blob = pdfCache.current.get(selected.id);
      if (!blob) {
        blob = await generatePautaPdfBlob(selected, members, club);
        pdfCache.current.set(selected.id, blob);
      }
      downloadBlob(blob, pautaFileName(selected));
    } catch {
      AlertError("Não foi possível baixar o PDF da pauta.");
    } finally {
      setDownloadingPdf(false);
    }
  }

  return {
    firstName,
    pautas,
    selected,
    setSelectedId,
    isLoading,
    loadError,
    members,
    generatingPdf,
    downloadingPdf,
    canImportPendingItems: Boolean(pendingSource),
    handleCreatePauta,
    handleUpdatePauta,
    handleRemovePauta,
    handleDuplicatePauta,
    handleCreateItem,
    handleUpdateItem,
    handleChangeItemStatus,
    handleRemoveItem,
    handleMoveItem,
    handleImportPendingItems,
    handleGeneratePdf,
    handleDownloadPdf,
  };
}
