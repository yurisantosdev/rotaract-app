"use client";

import { useRef, useState } from "react";
import { ImageIcon, TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { LOGO_ACCEPT } from "../types/settings";
import { fileToImageDataUrl } from "../services/logo";

type ClubLogoFieldProps = {
  clubName: string;
  logoUrl: string;
  onChange: (logoUrl: string) => void;
  onError: (message: string) => void;
};

function initialsFromClubName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (!first) return "RC";
  if (!last || parts.length === 1) return first.slice(0, 2).toUpperCase();
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

export function ClubLogoField({
  clubName,
  logoUrl,
  onChange,
  onError,
}: ClubLogoFieldProps) {
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

  return (
    <div>
      <span className="mb-1.5 block text-sm text-zinc-600">Logomarca</span>
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
        className={`relative overflow-hidden rounded-3xl border border-dashed p-4 transition ${dragging
            ? "border-rotaract-pink bg-rotaract-pink/5"
            : "border-zinc-200 bg-rotaract-mist/70"
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={LOGO_ACCEPT}
          className="sr-only"
          onChange={(event) => {
            applyFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`Logomarca de ${clubName || "clube"}`}
                className="h-full w-full object-contain p-2"
              />
            ) : (
              <span className="text-lg font-semibold text-rotaract-pink">
                {initialsFromClubName(clubName)}
              </span>
            )}
          </span>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-sm font-medium text-zinc-800">
              {dragging
                ? "Solte a imagem aqui"
                : reading
                  ? "Convertendo imagem..."
                  : "Arraste uma imagem ou envie do computador"}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              PNG, JPG ou WEBP até 2 MB, salva em base64. Ela aparece no preview ao lado.
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              <button
                type="button"
                disabled={reading}
                onClick={() => inputRef.current?.click()}
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-3 text-sm font-semibold text-zinc-800 shadow-sm ring-1 ring-zinc-200 transition hover:border-rotaract-pink hover:text-rotaract-pink disabled:opacity-50"
              >
                {logoUrl ? (
                  <ImageIcon size={16} weight="bold" aria-hidden />
                ) : (
                  <UploadSimpleIcon size={16} weight="bold" aria-hidden />
                )}
                {logoUrl ? "Trocar imagem" : "Enviar logomarca"}
              </button>
              {logoUrl ? (
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-zinc-500 transition hover:bg-white hover:text-rose-600"
                >
                  <TrashIcon size={16} weight="bold" aria-hidden />
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
