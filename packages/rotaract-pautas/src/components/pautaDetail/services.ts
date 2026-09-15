"use client";

import { AlertError, AlertSuccess, usePagination } from "@rotaract/components";
import { useEffect, useMemo, useRef, useState } from "react";
import { membersByIds } from "../../lib/members";
import {
  getPautaItemProgress,
  uniqueIds,
  type PautaDetailProps,
} from "../../types/pautas";
import {
  sortPautaItems,
  type PautaItem,
  type PautaItemFilter,
  type PautaItemPayload,
} from "../../types/pautaItems";

export function usePautaDetail({
  pauta,
  members,
  onCreateItem,
  onUpdateItem,
  onUpdatePauta,
}: PautaDetailProps) {
  const [pautaFormOpen, setPautaFormOpen] = useState(false);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PautaItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<PautaItem | null>(null);
  const [confirmRemovePauta, setConfirmRemovePauta] = useState(false);
  const [itemFilter, setItemFilter] = useState<PautaItemFilter>("todos");
  const [celebrate, setCelebrate] = useState(false);
  const [celebrationBurst, setCelebrationBurst] = useState(0);
  const [markingAsRealized, setMarkingAsRealized] = useState(false);
  const canMarkAsRealized =
    pauta.status !== "realizada" && pauta.status !== "cancelada";
  const wasCompleteRef = useRef<boolean | null>(null);
  const trackedPautaId = useRef(pauta.id);

  const present = membersByIds(members, pauta.presentMemberIds);
  const progress = getPautaItemProgress(pauta.items);
  const pendingItems = pauta.items.filter((item) => item.status === "pendente").length;
  const resolvedItems = pauta.items.filter((item) => item.status === "resolvido").length;
  const postponedItems = pauta.items.filter((item) => item.status === "adiado").length;
  const assignableMembers =
    present.length > 0
      ? membersByIds(
          members,
          uniqueIds([
            ...pauta.presentMemberIds,
            editingItem?.responsibleId ?? "",
          ])
        )
      : members;

  useEffect(() => {
    const isComplete = progress.percent === 100 && progress.total > 0;

    if (trackedPautaId.current !== pauta.id) {
      trackedPautaId.current = pauta.id;
      wasCompleteRef.current = isComplete;
      setCelebrate(false);
      return;
    }

    if (wasCompleteRef.current === null) {
      wasCompleteRef.current = isComplete;
      return;
    }

    if (isComplete && !wasCompleteRef.current) {
      setCelebrate(true);
      setCelebrationBurst((burst) => burst + 1);
    }

    wasCompleteRef.current = isComplete;
  }, [progress.percent, progress.total, pauta.id]);

  const filteredItems = useMemo(() => {
    return sortPautaItems(pauta.items).filter((item) => {
      if (itemFilter === "todos") return true;
      return item.status === itemFilter;
    });
  }, [itemFilter, pauta.items]);

  const pagination = usePagination(filteredItems, {
    resetKey: `${pauta.id}|${itemFilter}`,
  });

  function openCreateItem() {
    setEditingItem(null);
    setItemFormOpen(true);
  }

  function openEditItem(item: PautaItem) {
    setEditingItem(item);
    setItemFormOpen(true);
  }

  function closeItemForm() {
    setItemFormOpen(false);
    setEditingItem(null);
  }

  function handleSaveItem(payload: PautaItemPayload) {
    if (editingItem) {
      return onUpdateItem(editingItem.id, payload);
    }
    return onCreateItem(payload);
  }

  async function handleMarkAsRealized() {
    if (!canMarkAsRealized || markingAsRealized) return;

    setMarkingAsRealized(true);
    try {
      await onUpdatePauta({
        title: pauta.title,
        meetingDate: pauta.meetingDate,
        type: pauta.type,
        status: "realizada",
        notes: pauta.notes,
        presentMemberIds: pauta.presentMemberIds,
        calendarEventId: pauta.calendarEventId,
      });
      AlertSuccess("Reunião marcada como realizada");
      setCelebrate(true);
      setCelebrationBurst((burst) => burst + 1);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") {
        return;
      }
      AlertError("Não foi possível marcar a reunião como realizada.");
    } finally {
      setMarkingAsRealized(false);
    }
  }

  return {
    celebrationBurst,
    celebrate,
    setCelebrate,
    markingAsRealized,
    canMarkAsRealized,
    handleMarkAsRealized,
    pautaFormOpen,
    setPautaFormOpen,
    itemFormOpen,
    itemToDelete,
    setItemToDelete,
    confirmRemovePauta,
    setConfirmRemovePauta,
    itemFilter,
    setItemFilter,
    present,
    progress,
    pendingItems,
    resolvedItems,
    postponedItems,
    assignableMembers,
    filteredItems,
    pagination,
    editingItem,
    openCreateItem,
    openEditItem,
    closeItemForm,
    handleSaveItem,
  };
}
