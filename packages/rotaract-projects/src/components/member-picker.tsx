"use client";

import { useMemo, useState } from "react";
import { CheckIcon } from "@phosphor-icons/react";
import { MemberAvatar, type Member } from "@rotaract/members";
import { selectableMembers } from "../lib/members";
import { normalizeSearch, PROJECT_INPUT_CLASS } from "../types/projects";

type MemberPickerProps = {
  members: Member[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  mode?: "single" | "multiple";
  label: string;
  hint?: string;
  lockedIds?: string[];
};

export function MemberPicker({
  members,
  selectedIds,
  onChange,
  mode = "multiple",
  label,
  hint,
  lockedIds = [],
}: MemberPickerProps) {
  const [query, setQuery] = useState("");
  const selected = useMemo(
    () => members.filter((member) => selectedIds.includes(member.id)),
    [members, selectedIds]
  );
  const options = useMemo(() => {
    const term = normalizeSearch(query);
    return selectableMembers(members, selectedIds).filter((member) => {
      if (!term) return true;
      return (
        normalizeSearch(member.name).includes(term) ||
        normalizeSearch(member.role).includes(term)
      );
    });
  }, [members, query, selectedIds]);

  const optionIds = options.map((member) => member.id);
  const allSelected =
    mode === "multiple" &&
    optionIds.length > 0 &&
    optionIds.every((id) => selectedIds.includes(id));

  function toggle(id: string) {
    if (lockedIds.includes(id) && selectedIds.includes(id)) return;

    if (mode === "single") {
      onChange(selectedIds[0] === id ? [] : [id]);
      return;
    }

    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((item) => item !== id)
        : [...selectedIds, id]
    );
  }

  function toggleAll() {
    if (mode !== "multiple") return;
    if (allSelected) {
      onChange(selectedIds.filter((id) => !optionIds.includes(id) || lockedIds.includes(id)));
      return;
    }
    onChange(Array.from(new Set([...selectedIds, ...optionIds])));
  }

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
            placeholder="Buscar por nome ou cargo"
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
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${
                        selectedMember ? "bg-rotaract-pink/5" : "hover:bg-zinc-50"
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
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          selectedMember
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
