import { HandCoinsIcon } from '@phosphor-icons/react'
import { Button, ButtonExcel, Tooltip } from '@rotaract/components'
import React from 'react'

export type ButtonsExcelGenerateProps = {
  onDownload: () => void
  onGenerate: () => void
}

export function ButtonsExcelGenerate({ onDownload, onGenerate }: ButtonsExcelGenerateProps) {
  return (
    <div className="flex items-center gap-3">
      <ButtonExcel
        onClick={() => onDownload()}
      />

      <Tooltip label="Gerar Mensalidades">
        <Button
          aria-label="Gerar Mensalidades"
          icon={<HandCoinsIcon className="h-5 w-5" />}
          onClick={() => onGenerate()}
        />
      </Tooltip>
    </div>
  )
}