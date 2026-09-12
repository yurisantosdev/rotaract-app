"use client";

import { CheckIcon } from "@phosphor-icons/react";
import { MemberAvatar } from "@rotaract/members";
import { PROJECT_INPUT_CLASS } from "../../types/projects";
import { MemberPickerProps } from "./type";
import { useMemberPicker } from "./services";

export function MemberPicker({
  members,
  selectedIds,
  onChange,
  mode = "multiple",
  label,
  hint,
  lockedIds = [],
}: MemberPickerProps) {

  const data = useMemberPicker({
    members,
    selectedIds,
    onChange,
    mode,
    label,
    hint,
    lockedIds
  });
  if (!data) return null;
  const {
    selected,
    toggle,
    toggleAll,
    options,
    query,
    setQuery,
    allSelected,
    optionIds
  } = data;

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-600">{label}</p>
          <p className="mt-0.5 text-xs text-zinc-400">
            {hint ??
              (selected.length === 0
                ? "Nenhum selecionado ainda"
                : `${selected.length} ${selected.length === 1 ? "selecionado" : "selecionados"}`)}
          </p>
        </div>
        {mode === "multiple" && members.length > 0 ? (
          <button
            type="button"
            onClick={toggleAll}
            disabled={optionIds.length === 0}
            className="text-sm font-medium text-rotaract-pink transition hover:text-rotaract-magenta disabled:text-zinc-400"
          >
            {allSelected ? "Limpar seleção" : "Selecionar todos"}
          </button>
        ) : null}
      </div>

      {selected.length > 0 && mode === "multiple" ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {selected.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => toggle(member.id)}
              disabled={lockedIds.includes(member.id)}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white py-1 pl-1 pr-3 text-xs font-medium text-zinc-700 transition hover:border-rose-200 hover:text-rose-600 disabled:cursor-default disabled:hover:border-zinc-200 disabled:hover:text-zinc-700"
            >
              <MemberAvatar member={member} size="xs" />
              {member.name.split(" ")[0]}
            </button>
          ))}
        </div>
      ) : null}

      {members.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-dashed border-zinc-200 px-4 py-5 text-sm text-zinc-500">
          Cadastre companheiros no módulo de membros para vinculá-los aos projetos.
        </p>
      ) : (
        <>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={`${PROJECT_INPUT_CLASS} mt-3`}
            placeholder="Pesquisar..."
          />
          <ul className="mt-3 max-h-48 divide-y divide-zinc-100 overflow-y-auto rounded-2xl border border-zinc-200">
            {options.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-zinc-500">
                Nenhum membro encontrado.
              </li>
            ) : (
              options.map((member) => {
                const selectedMember = selectedIds.includes(member.id);
                return (
                  <li key={member.id}>
                    <button
                      type="button"
                      onClick={() => toggle(member.id)}
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${selectedMember ? "bg-rotaract-pink/5" : "hover:bg-zinc-50"
                        }`}
                    >
                      <MemberAvatar member={member} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-zinc-900">
                          {member.name}
                        </span>
                        <span className="block truncate text-xs text-zinc-500">
                          {member.role}
                        </span>
                      </span>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selectedMember
                          ? "border-rotaract-pink bg-rotaract-pink text-white"
                          : "border-zinc-300 bg-white"
                          }`}
                      >
                        {selectedMember ? (
                          <CheckIcon className="h-3 w-3" weight="bold" />
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </>
      )}
    </div>
  );
}
