"use client";

import { fileToPhotoDataUrl } from "../../../src/services/database.photo.services";
import { useRef, useState } from "react";
import { MemberPhotoFieldProps } from "./type";

export function useMemberPhotoField({
  name,
  photoUrl,
  onChange,
  onError
}: MemberPhotoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState(false);

  async function applyFile(file: File | undefined) {
    if (!file) return;

    setReading(true);
    try {
      const dataUrl = await fileToPhotoDataUrl(file);
      onError("");
      onChange(dataUrl);
    } catch (caught: unknown) {
      onError(
        caught instanceof Error ? caught.message : "Não foi possível ler a foto."
      );
    } finally {
      setReading(false);
    }
  }

  return {
    inputRef,
    dragging,
    reading,
    applyFile,
    setDragging
  };
}
