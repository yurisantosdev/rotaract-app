"use client";

import { selectableMembers } from "../../../src/lib/members";
import { normalizeSearch } from "../../../src/types/projects";
import { useMemo, useState } from "react";
import { MemberPickerProps } from "./type";

export function useMemberPicker({
  members,
  selectedIds,
  onChange,
  mode,
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

  return {
    selected,
    toggle,
    toggleAll,
    options,
    query,
    setQuery,
    allSelected,
    optionIds
  };
}
