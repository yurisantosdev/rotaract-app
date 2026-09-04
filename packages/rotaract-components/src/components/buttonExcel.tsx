import React from "react";
import { Tooltip } from "./tooltip";
import { MicrosoftExcelLogoIcon } from '@phosphor-icons/react'
import { ButtonInterface } from "../types/button";

export function ButtonExcel({ ...props }: ButtonInterface) {
  return (
    <Tooltip label="Baixar relatório">
      <button
        type="button"
        aria-label="Baixar relatório"
        className="inline-flex items-center justify-center rounded-full bg-emerald-500 p-3.5 transition hover:bg-emerald-600 cursor-pointer"
        {...props}
      >
        <MicrosoftExcelLogoIcon className="h-5 w-5" color="white" />
      </button>
    </Tooltip>
  )
}