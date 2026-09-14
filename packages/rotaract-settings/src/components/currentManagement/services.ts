"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { reloadMembers } from "@rotaract/members";
import { useOptionalViewingManagement } from "./viewingManagement";
import { UseCurrentManagementProps } from "./type";

export function useCurrentManagement({
  currentManagement,
  onCreateManagement,
}: UseCurrentManagementProps) {
  const dispatch = useDispatch();
  const session = useOptionalViewingManagement();
  const [localViewing, setLocalViewing] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    void dispatch(reloadMembers() as never);
  }, [dispatch]);

  const viewingOptions = session?.viewingOptions ?? [];
  const resolvedViewing = session
    ? session.viewingManagement
    : localViewing;
  const viewingManagement = viewingOptions.includes(resolvedViewing)
    ? resolvedViewing
    : viewingOptions.includes(currentManagement)
      ? currentManagement
      : viewingOptions[0] || "";
  const setViewingManagement = session
    ? session.setViewingManagement
    : setLocalViewing;

  useEffect(() => {
    if (session) return;
    if (!viewingManagement || viewingOptions.includes(viewingManagement)) {
      return;
    }
    const next = viewingOptions.includes(currentManagement)
      ? currentManagement
      : viewingOptions[0];
    if (next) setViewingManagement(next);
  }, [
    currentManagement,
    session,
    setViewingManagement,
    viewingManagement,
    viewingOptions,
  ]);

  const isViewingCurrent =
    Boolean(viewingManagement) && viewingManagement === currentManagement;

  async function handleCreate(name: string) {
    await onCreateManagement(name);
    setViewingManagement(name);
  }

  return {
    viewingManagement,
    viewingOptions,
    setViewingManagement,
    modalOpen,
    setModalOpen,
    isViewingCurrent,
    handleCreate,
  };
}
