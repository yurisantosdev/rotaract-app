"use client";

import { CheckIcon } from "@phosphor-icons/react";
import { ManagementsFieldProps } from "./type";
import { useManagementsField } from "./services";

export function ManagementsField({
  options,
  selected,
  currentManagement,
  onChange,
  disabled,
}: ManagementsFieldProps) {
  const data = useManagementsField({
    options,
    selected,
    currentManagement,
    onChange,
    disabled,
  });
  if (!data) return null;
  const { toggle } = data;

  return (
    <div>
      <span className="mb-1.5 block text-sm text-zinc-600">
        Gestões de acesso
      </span>
      {options.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
          Nenhuma gestão cadastrada no clube.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((management) => {
            const checked = selected.includes(management);
            return (
              <button
                key={management}
                type="button"
                aria-pressed={checked}
                disabled={disabled}
                onClick={() => toggle(management)}
                className={`inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  checked
                    ? "bg-rotaract-pink text-white"
                    : "border border-zinc-200 bg-zinc-50 text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {checked ? (
                  <CheckIcon size={14} weight="bold" aria-hidden />
                ) : null}
                {management === currentManagement
                  ? `${management} (atual)`
                  : management}
              </button>
            );
          })}
        </div>
      )}
      <p className="mt-1.5 text-xs text-zinc-400">
        Selecione as gestões que este membro pode visualizar no aplicativo.
      </p>
    </div>
  );
}
