import { MicrosoftExcelLogoIcon } from '@phosphor-icons/react'
import { Button, Tooltip } from '@rotaract/components'
import React from 'react'

export type ButtonsExcelGenerateProps = {
  onDownload: () => void
  onGenerate: () => void
}

export function ButtonsExcelGenerate({ onDownload, onGenerate }: ButtonsExcelGenerateProps) {
  return (
    <div className="flex items-center gap-3">
      <Tooltip label="Baixar relatório">
        <div className="cursor-pointer bg-emerald-500 hover:bg-emerald-600 p-3 rounded-full">
          <MicrosoftExcelLogoIcon
            className="h-4 w-4"
            onClick={() => onDownload()}
            color="white"
          />
        </div>
      </Tooltip>

      <div className="flex items-center gap-2">
        <Button title="Gerar" onClick={() => onGenerate()} />
      </div>
    </div>
  )
}