import React from "react";
import Link from "next/link";
import { ReturnModuleProps } from "../types/returnModule";

export function ReturnModule({ backHref }: ReturnModuleProps) {
  return (
    <Link
      href={backHref}
      className="text-sm font-medium text-rotaract-pink transition hover:text-rotaract-magenta"
    >
      ← Voltar para os módulos
    </Link>
  );
}