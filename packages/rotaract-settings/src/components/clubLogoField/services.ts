"use client";

import { fileToImageDataUrl } from "../../../src/services/logo.services";
import { useRef, useState } from "react";
import { UseClubLogoFieldProps } from "./type";

export function useClubLogoField({
  onError,
  onChange
}: UseClubLogoFieldProps) {
  function initialsFromClubName(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const first = parts[0];
    const last = parts[parts.length - 1];
    if (!first) return "RC";
    if (!last || parts.length === 1) return first.slice(0, 2).toUpperCase();
    return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
  }
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState(false);

  async function applyFile(file: File | undefined) {
    if (!file) return;

    setReading(true);
    try {
      const dataUrl = await fileToImageDataUrl(file);
      onError("");
      onChange(dataUrl);
    } catch (caught: unknown) {
      onError(
        caught instanceof Error ? caught.message : "Não foi possível ler a imagem."
      );
    } finally {
      setReading(false);
    }
  }


  return {
    initialsFromClubName,
    setDragging,
    applyFile,
    dragging,
    inputRef,
    reading
  };
}
