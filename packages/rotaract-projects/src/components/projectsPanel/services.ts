"use client";

import { usePagination } from "@rotaract/components";
import { ProjectsPanelProps } from "./type";
import { ProjectFilter, getProjectProgress, getProjectStatus, getProjectTasks, matchesProjectFilter, normalizeSearch } from "../../../src/types/projects";
import { findMember } from "../../../src/lib/members";
import { useMemo, useState } from "react";

export function useProjectsPanel({
  projects,
  tasks,
  members,
  currentUserId,
  onOpen,
  onCreate,
}: ProjectsPanelProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ProjectFilter>("todos");
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => {
    const term = normalizeSearch(query);

    return projects
      .map((project) => {
        const projectTasks = getProjectTasks(project.id, tasks);
        const status = getProjectStatus(projectTasks);
        const progress = getProjectProgress(projectTasks);
        const manager = findMember(members, project.managerId);
        return { project, projectTasks, status, progress, manager };
      })
      .filter((item) => {
        if (!matchesProjectFilter(item.status, filter)) return false;
        if (!term) return true;
        return (
          normalizeSearch(item.project.title).includes(term) ||
          normalizeSearch(item.project.description).includes(term) ||
          normalizeSearch(item.manager?.name ?? "").includes(term)
        );
      })
      .sort((a, b) => b.project.updatedAt.localeCompare(a.project.updatedAt));
  }, [filter, members, projects, query, tasks]);

  const pagination = usePagination(filtered, {
    resetKey: `${query}|${filter}`,
  });

  return {
    query,
    setQuery,
    filter,
    setFilter,
    filtered,
    pagination,
    setFormOpen,
    formOpen
  };
}
