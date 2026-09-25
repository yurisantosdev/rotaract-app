"use client";

import { AlertError, AlertSuccess } from "@rotaract/components";
import { useEffect, useState } from "react";
import { type Reports, type ReportsPayload } from "../types/reports";
import {
  listReports,
  removeReports,
  updateReports,
} from "./database.reports.services";

export function useReportsPage(userName: string) {
  const firstName = userName.split(" ")[0] || userName;
  const [reports, setReports] = useState<Reports[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    void listReports(controller.signal)
      .then((items) => {
        if (controller.signal.aborted) return;
        setReports(items);
        setLoadError("");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setReports([]);
        setLoadError("Não foi possível carregar os Feedbacks.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  function handleUpdate(id: string, payload: ReportsPayload) {
    const controller = new AbortController();

    return updateReports(id, controller.signal, payload)
      .then((updated) => {
        setReports((current) =>
          current.map((item) => (item.id === updated.id ? updated : item))
        );
        AlertSuccess("Feedback atualizado com sucesso");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        AlertError("Não foi possível atualizar o Feedback.");
        throw error;
      });
  }

  function handleRemove(id: string) {
    const controller = new AbortController();

    return removeReports(id, controller.signal)
      .then(() => {
        setReports((current) => current.filter((item) => item.id !== id));
        AlertSuccess("Feedback excluído com sucesso");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        AlertError("Não foi possível excluir o Feedback.");
        throw error;
      });
  }

  return {
    firstName,
    reports,
    isLoading,
    loadError,
    handleUpdate,
    handleRemove,
  };
}
