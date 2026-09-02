"use client";

import { useRef, useState } from "react";
import { CameraIcon, TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { initialsFromName, PHOTO_ACCEPT } from "../types/member";
import { fileToPhotoDataUrl } from "../services/photo";

type MemberPhotoFieldProps = {
  name: string;
  photoUrl: string;
  onChange: (photoUrl: string) => void;
  onError: (message: string) => void;
};

export function MemberPhotoField({
  name,
  photoUrl,
  onChange,
  onError,
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

  return (
    <div>
      <span className="mb-1.5 block text-sm text-zinc-600">Foto</span>
      <div
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          if (event.currentTarget.contains(event.relatedTarget as Node)) return;
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          applyFile(event.dataTransfer.files[0]);
        }}
        className={`relative overflow-hidden rounded-3xl border border-dashed p-4 transition ${
          dragging
            ? "border-rotaract-pink bg-rotaract-pink/5"
            : "border-zinc-200 bg-rotaract-mist/70"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={PHOTO_ACCEPT}
          className="sr-only"
          onChange={(event) => {
            applyFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />

        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-white text-sm font-semibold text-rotaract-pink shadow-sm">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              initialsFromName(name)
            )}
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-zinc-800">
              {dragging
                ? "Solte a foto aqui"
                : reading
                  ? "Preparando foto..."
                  : "Arraste uma foto ou envie do computador"}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              PNG, JPG ou WEBP até 2 MB. Sem foto, usamos as iniciais.
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={reading}
                onClick={() => inputRef.current?.click()}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3 text-sm font-semibold text-zinc-800 shadow-sm ring-1 ring-zinc-200 transition hover:text-rotaract-pink disabled:opacity-50"
              >
                {photoUrl ? (
                  <CameraIcon size={15} weight="bold" aria-hidden />
                ) : (
                  <UploadSimpleIcon size={15} weight="bold" aria-hidden />
                )}
                {photoUrl ? "Trocar foto" : "Enviar foto"}
              </button>
              {photoUrl ? (
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-zinc-500 transition hover:bg-white hover:text-rose-600"
                >
                  <TrashIcon size={15} weight="bold" aria-hidden />
                  Remover
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
