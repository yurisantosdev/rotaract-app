"use client";

import { useEffect, useMemo, useState } from "react";
import { useMembersStatus } from "@rotaract/members";
import { useViewingManagement } from "@rotaract/settings";
import { Movement, Tab } from "../types/movement";
import { Contribution, GenerateContributionsPayload, isUnpaidContribution } from "../types/contributions";
import { createMovement, listMovements, removeMovement, updateMovement } from "./database.movements.services";
import { exemptContribution, generateContributions, listContributions, removeContribution, updateContribution } from "./database.contributions.services";
import { isInCurrentMonth } from "./money.services";
import { downloadFinanceReport } from "./report.services";

export function useFinance(userName: string) {
  const firstName = userName.split(" ")[0] || userName;
  const membersStatus = useMembersStatus();
  const { viewingManagement, viewingOptions } = useViewingManagement();
  const [tab, setTab] = useState<Tab>("movimentos");
  const [movements, setMovements] = useState<Movement[]>([]);
  const [contributions, setContributions] =
    useState<Contribution[]>([]);
  const [isLoadingFinance, setIsLoadingFinance] = useState(true);
  const isLoading =
    isLoadingFinance ||
    membersStatus === "idle" ||
    membersStatus === "loading";

  useEffect(() => {
    if (!viewingManagement) {
      const waitingForViewing =
        membersStatus === "idle" ||
        membersStatus === "loading" ||
        viewingOptions.length > 0;

      if (waitingForViewing) {
        setIsLoadingFinance(true);
        return;
      }

      setMovements([]);
      setContributions([]);
      setIsLoadingFinance(false);
      return;
    }

    const controller = new AbortController();
    setIsLoadingFinance(true);

    void Promise.all([
      listMovements(controller.signal, viewingManagement)
        .then(setMovements)
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
          setMovements([]);
        }),
      listContributions(controller.signal, viewingManagement)
        .then(setContributions)
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
          setContributions([]);
        }),
    ]).finally(() => {
      if (!controller.signal.aborted) {
        setIsLoadingFinance(false);
      }
    });

    return () => controller.abort();
  }, [membersStatus, viewingManagement, viewingOptions.length]);

  const totals = useMemo(() => {
    const income = movements
      .filter((item) => item.type === "entrada")
      .reduce((sum, item) => sum + item.value, 0);
    const expense = movements
      .filter((item) => item.type === "saida")
      .reduce((sum, item) => sum + item.value, 0);
    const monthIncome = movements
      .filter((item) => item.type === "entrada" && isInCurrentMonth(item.date))
      .reduce((sum, item) => sum + item.value, 0);
    const monthExpense = movements
      .filter((item) => item.type === "saida" && isInCurrentMonth(item.date))
      .reduce((sum, item) => sum + item.value, 0);
    const pending = contributions.filter((item) =>
      isUnpaidContribution(item.status)
    );

    return {
      balance: income - expense,
      monthIncome,
      monthExpense,
      pendingCount: pending.length,
      pendingValue: pending.reduce((sum, item) => sum + item.value, 0),
    };
  }, [contributions, movements]);

  function handleAddMovement(movement: Omit<Movement, "id">) {
    const controller = new AbortController();

    return createMovement(controller.signal, movement).then((created) => {
      if (created.management !== viewingManagement) return;
      setMovements((current) => [
        {
          id: created.id,
          date: created.date,
          description: created.description,
          category: created.category,
          type: created.type,
          value: created.value,
          management: created.management,
        },
        ...current,
      ]);
    });
  }

  function handleImportedMovements(created: Movement[]) {
    if (created.length === 0) return;

    setMovements((current) => {
      const existingIds = new Set(current.map((item) => item.id));
      const incoming = created.filter(
        (item) =>
          !existingIds.has(item.id) && item.management === viewingManagement
      );
      return incoming.length === 0 ? current : [...incoming, ...current];
    });
  }

  function handleUpdateMovement(movement: Movement) {
    const controller = new AbortController();

    return updateMovement(movement.id, controller.signal, movement).then(
      (updated) => {
        setMovements((current) =>
          current.map((item) =>
            item.id === movement.id
              ? {
                ...item,
                date: updated.date,
                description: updated.description,
                category: updated.category,
                type: updated.type,
                value: updated.value,
              }
              : item
          )
        );
      }
    );
  }

  function handleRemoveMovement(id: string) {
    const controller = new AbortController();

    void removeMovement(id, controller.signal)
      .then(() => {
        setMovements((current) => current.filter((item) => item.id !== id));
      })
      .catch(() => undefined);
  }

  function refreshMovements() {
    const controller = new AbortController();
    return listMovements(controller.signal, viewingManagement)
      .then(setMovements)
      .catch(() => undefined);
  }

  function handleToggleContribution(ids: string[]) {
    if (ids.length === 0) return Promise.resolve();

    const controller = new AbortController();
    const jobs = ids.flatMap((id) => {
      const contribution = contributions.find((item) => item.id === id);
      if (!contribution) return [];
      const nextStatus = isUnpaidContribution(contribution.status)
        ? "pago"
        : "pendente";
      return [
        updateContribution(id, controller.signal, {
          ...contribution,
          status: nextStatus,
        }),
      ];
    });

    if (jobs.length === 0) return Promise.resolve();

    return Promise.all(jobs)
      .then((updated) => {
        const statusById = new Map(updated.map((item) => [item.id, item.status]));
        setContributions((current) =>
          current.map((item) =>
            statusById.has(item.id)
              ? { ...item, status: statusById.get(item.id)! }
              : item
          )
        );
        return refreshMovements();
      })
      .catch(() => undefined);
  }

  function handleExemptContribution(ids: string[]) {
    if (ids.length === 0) return Promise.resolve();

    const controller = new AbortController();

    return Promise.all(
      ids.map((id) => exemptContribution(id, controller.signal))
    )
      .then((updated) => {
        const statusById = new Map(updated.map((item) => [item.id, item.status]));
        setContributions((current) =>
          current.map((item) =>
            statusById.has(item.id)
              ? { ...item, status: statusById.get(item.id)! }
              : item
          )
        );
        return refreshMovements();
      })
      .catch(() => undefined);
  }

  function handleRemoveContribution(ids: string[]) {
    if (ids.length === 0) return Promise.resolve();

    const controller = new AbortController();
    const idSet = new Set(ids);

    return Promise.all(ids.map((id) => removeContribution(id, controller.signal)))
      .then(() => {
        setContributions((current) =>
          current.filter((item) => !idSet.has(item.id))
        );
        return refreshMovements();
      })
      .catch(() => undefined);
  }

  function handleGenerateContributions(payload: GenerateContributionsPayload) {
    const controller = new AbortController();

    return generateContributions(controller.signal, payload).then((result) => {
      const created = result.created.filter(
        (item) => item.management === viewingManagement
      );
      if (created.length === 0) return;
      setContributions((current) => [...created, ...current]);
    });
  }

  function handleDownloadReport() {
    downloadFinanceReport({
      userName,
      movements,
      contributions,
    });
  }

  return {
    isLoading,
    firstName,
    tab,
    setTab,
    movements,
    contributions,
    totals,
    handleAddMovement,
    handleUpdateMovement,
    handleRemoveMovement,
    handleImportedMovements,
    handleToggleContribution,
    handleExemptContribution,
    handleRemoveContribution,
    handleGenerateContributions,
    handleDownloadReport
  };
}
