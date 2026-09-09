import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { Tooltip } from "@rotaract/components";
import React from "react";

type EditDeleteProjectProp = {
  onEdit: () => void;
  onDelete: () => void;
}

export function EditDeleteProject({ onEdit, onDelete }: EditDeleteProjectProp) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Tooltip label="Editar projeto">
        <button
          type="button"
          aria-label="Editar projeto"
          onClick={onEdit}
          className="rounded-full p-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
        >
          <PencilSimpleIcon className="h-4 w-4" />
        </button>
      </Tooltip>
      <Tooltip label="Excluir projeto">
        <button
          type="button"
          aria-label="Excluir projeto"
          onClick={onDelete}
          className="rounded-full p-1.5 text-zinc-400 transition hover:bg-rose-50 hover:text-rose-600"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </Tooltip>
    </div>
  )
}