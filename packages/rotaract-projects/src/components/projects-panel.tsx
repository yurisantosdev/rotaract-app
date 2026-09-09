"use client";

import { useMemo, useState } from "react";
import { FolderSimpleIcon, PlusIcon } from "@phosphor-icons/react";
import { Button, Tooltip } from "@rotaract/components";
import { MemberAvatar, type Member } from "@rotaract/members";
import { formatDate } from "../lib/dates";
import { findMember, firstName, membersByIds } from "../lib/members";
import {
  getProjectProgress,
  getProjectStatus,
  getProjectTasks,
  matchesProjectFilter,
  normalizeSearch,
  PROJECT_FILTERS,
  PROJECT_INPUT_CLASS,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_STYLES,
  type Project,
  type ProjectFilter,
  type ProjectPayload,
} from "../types/projects";
import type { Task } from "../types/tasks";
import { ProjectFormModal } from "./project-form-modal";

type ProjectsPanelProps = {
  projects: Project[];
  tasks: Task[];
  members: Member[];
  currentUserId?: string;
  onOpen: (projectId: string) => void;
  onCreate: (payload: ProjectPayload) => void | Promise<void>;
};

export function ProjectsPanel({
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

  return (
    <section className="mt-8 rounded-3xl border border-zinc-200 bg-white p-4 shadow-[0_12px_40px_rgba(24,24,27,0.04)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Projetos do clube</h2>
          <p className="mt-1 hidden text-sm text-zinc-500 md:flex">
            Acompanhe responsáveis, equipe e o andamento das tarefas.
          </p>
        </div>
        <Tooltip label="Novo projeto">
          <Button
            aria-label="Novo projeto"
            icon={<PlusIcon className="h-5 w-5" />}
            onClick={() => setFormOpen(true)}
          />
        </Tooltip>
      </div>

      <div className="mt-5 flex justify-center gap-2 sm:flex-row">
        <div className="min-w-0 flex-1">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={PROJECT_INPUT_CLASS}
            placeholder="Pesquisar..."
          />
        </div>
        <div className="w-[30%]">
          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as ProjectFilter)
            }
            className={`${PROJECT_INPUT_CLASS} sm:max-w-xs`}
            aria-label="Status do projeto"
          >
            {PROJECT_FILTERS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-zinc-400">
        {filtered.length} {filtered.length === 1 ? "projeto" : "projetos"}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-2 flex flex-col items-center px-4 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rotaract-pink/10 text-rotaract-pink">
            <FolderSimpleIcon className="h-6 w-6" weight="bold" aria-hidden />
          </span>
          <p className="mt-4 text-sm font-medium text-zinc-800">
            {projects.length === 0
              ? "Nenhum projeto cadastrado ainda."
              : "Nenhum projeto encontrado com esses filtros."}
          </p>
          <p className="mt-1 max-w-sm text-sm text-zinc-500">
            {projects.length === 0
              ? "Comece cadastrando a primeira ação do clube."
              : "Tente outro nome ou limpe o filtro para ver a lista completa."}
          </p>
          {projects.length === 0 ? (
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="mt-5 text-sm font-semibold text-rotaract-pink transition hover:text-rotaract-magenta"
            >
              Cadastrar primeiro projeto
            </button>
          ) : null}
        </div>
      ) : (
        <ul className="mt-2 grid gap-3">
          {filtered.map(({ project, status, progress, manager }, index) => {
            const team = membersByIds(members, project.members);
            return (
              <li
                key={project.id}
                className="home-rise"
                style={{ animationDelay: `${80 + index * 50}ms` }}
              >
                <button
                  type="button"
                  onClick={() => onOpen(project.id)}
                  className="w-full rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-rotaract-pink/30 hover:bg-white hover:shadow-[0_20px_48px_rgba(255,45,122,0.10)] sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium text-zinc-900">
                          {project.title}
                        </p>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${PROJECT_STATUS_STYLES[status]}`}
                        >
                          {PROJECT_STATUS_LABELS[status]}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                        {project.description}
                      </p>
                    </div>
                    <span className="text-xs text-zinc-400">
                      {formatDate(project.createdAt.slice(0, 10))}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>
                        {progress.completed}/{progress.total}{" "}
                        {progress.total === 1 ? "tarefa" : "tarefas"}
                      </span>
                      <span className="tabular-nums">{progress.percent}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-200">
                      <div
                        className="h-full rounded-full bg-rotaract-pink"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      {manager ? <MemberAvatar member={manager} size="xs" /> : null}
                      <p className="truncate text-xs text-zinc-500">
                        {manager
                          ? `Responsável: ${firstName(manager.name)}`
                          : "Responsável não encontrado"}
                      </p>
                    </div>
                    {team.length > 0 ? (
                      <div className="flex items-center">
                        <div className="flex -space-x-2">
                          {team.slice(0, 4).map((member) => (
                            <span key={member.id} className="rounded-full ring-2 ring-white">
                              <MemberAvatar member={member} size="xs" />
                            </span>
                          ))}
                        </div>
                        <span className="ml-2 text-xs text-zinc-500">
                          {team.length} {team.length === 1 ? "envolvido" : "envolvidos"}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <ProjectFormModal
        open={formOpen}
        project={null}
        members={members}
        currentUserId={currentUserId}
        onClose={() => setFormOpen(false)}
        onSave={onCreate}
      />
    </section>
  );
}
