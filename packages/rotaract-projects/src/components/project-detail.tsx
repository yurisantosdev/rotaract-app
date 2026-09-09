"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ClipboardTextIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
} from "@phosphor-icons/react";
import { Button, CelebrationConfetti, ConfirmModal, Tooltip } from "@rotaract/components";
import { MemberAvatar, type Member } from "@rotaract/members";
import { formatDate } from "../lib/dates";
import { findMember, firstName, membersByIds } from "../lib/members";
import {
  getProjectProgress,
  getProjectStatus,
  uniqueIds,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_STYLES,
  ProjectDetailProps,
} from "../types/projects";
import {
  isTaskOverdue,
  TASK_STATUS_OPTIONS,
  TASK_STATUS_STYLES,
  taskStatusLabel,
  type Task,
  type TaskPayload,
  TaskFilter,
  TASK_FILTERS,
} from "../types/tasks";
import { ProjectFormModal } from "./project-form-modal";
import { TaskFormModal } from "./task-form-modal";
import { EditDeleteProject } from "./editDeleteProject";

export function ProjectDetail({
  project,
  tasks,
  members,
  onUpdateProject,
  onRemoveProject,
  onCreateTask,
  onUpdateTask,
  onChangeTaskStatus,
  onRemoveTask,
}: ProjectDetailProps) {
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [confirmRemoveProject, setConfirmRemoveProject] = useState(false);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("todas");
  const [celebrate, setCelebrate] = useState(false);
  const [celebrationBurst, setCelebrationBurst] = useState(0);
  const wasCompleteRef = useRef<boolean | null>(null);
  const trackedProjectId = useRef(project.id);

  const manager = findMember(members, project.managerId);
  const team = membersByIds(members, project.members);
  const assignableMembers = membersByIds(
    members,
    uniqueIds([
      project.managerId,
      ...project.members,
      editingTask?.managerId ?? "",
    ])
  );
  const status = getProjectStatus(tasks);
  const progress = getProjectProgress(tasks);
  const openTasks = tasks.filter(
    (task) => task.status !== "completed" && task.status !== "cancelled"
  ).length;
  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const overdueTasks = tasks.filter((task) => isTaskOverdue(task)).length;

  useEffect(() => {
    const isComplete = progress.percent === 100 && progress.total > 0;

    if (trackedProjectId.current !== project.id) {
      trackedProjectId.current = project.id;
      wasCompleteRef.current = isComplete;
      setCelebrate(false);
      return;
    }

    if (wasCompleteRef.current === null) {
      wasCompleteRef.current = isComplete;
      return;
    }

    if (isComplete && !wasCompleteRef.current) {
      setCelebrate(true);
      setCelebrationBurst((burst) => burst + 1);
    }

    wasCompleteRef.current = isComplete;
  }, [progress.percent, progress.total, project.id]);

  const filteredTasks = useMemo(() => {
    return [...tasks]
      .filter((task) => {
        if (taskFilter === "abertas") {
          return task.status !== "completed" && task.status !== "cancelled";
        }
        if (taskFilter === "concluidas") return task.status === "completed";
        if (taskFilter === "atrasadas") return isTaskOverdue(task);
        return true;
      })
      .sort((a, b) => {
        const overdueA = isTaskOverdue(a) ? 0 : 1;
        const overdueB = isTaskOverdue(b) ? 0 : 1;
        if (overdueA !== overdueB) return overdueA - overdueB;
        return a.limit.localeCompare(b.limit);
      });
  }, [taskFilter, tasks]);

  function openCreateTask() {
    setEditingTask(null);
    setTaskFormOpen(true);
  }

  function openEditTask(task: Task) {
    setEditingTask(task);
    setTaskFormOpen(true);
  }

  function closeTaskForm() {
    setTaskFormOpen(false);
    setEditingTask(null);
  }

  function handleSaveTask(payload: TaskPayload) {
    if (editingTask) {
      return onUpdateTask(editingTask.id, payload);
    }
    return onCreateTask(payload);
  }

  return (
    <div className="mt-8 space-y-4">
      <CelebrationConfetti
        key={celebrationBurst}
        active={celebrate}
        onComplete={() => setCelebrate(false)}
      />

      <section className="home-rise rounded-3xl border border-zinc-200 bg-white p-4 shadow-[0_12px_40px_rgba(24,24,27,0.04)] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex md:flex-wrap justify-between items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${PROJECT_STATUS_STYLES[status]}`}
              >
                {PROJECT_STATUS_LABELS[status]}
              </span>
              <span className="text-xs text-zinc-400">
                Criado em {formatDate(project.createdAt.slice(0, 10))}
              </span>

              <div className="md:hidden flex">
                <EditDeleteProject
                  onEdit={() => setProjectFormOpen(true)}
                  onDelete={() => setConfirmRemoveProject(true)}
                />
              </div>
            </div>
          </div>

          <div className="md:flex hidden">
            <EditDeleteProject
              onEdit={() => setProjectFormOpen(true)}
              onDelete={() => setConfirmRemoveProject(true)}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <article className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Responsável
            </p>
            {manager ? (
              <div className="mt-3 flex items-center gap-3">
                <MemberAvatar member={manager} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {manager.name}
                  </p>
                  <p className="truncate text-xs text-zinc-500">{manager.role}</p>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-zinc-500">Membro não encontrado.</p>
            )}
          </article>

          <article className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Equipe envolvida
            </p>
            {team.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">Nenhum companheiro vinculado.</p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {team.map((member) => (
                  <span
                    key={member.id}
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white py-1 pl-1 pr-3 text-xs font-medium text-zinc-700"
                  >
                    <MemberAvatar member={member} size="xs" />
                    {firstName(member.name)}
                  </span>
                ))}
              </div>
            )}
          </article>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>
              {progress.completed}/{progress.total}{" "}
              {progress.total === 1 ? "tarefa concluída" : "tarefas concluídas"}
            </span>
            <span className="tabular-nums">{progress.percent}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-rotaract-pink transition-[width] duration-500"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      </section>

      <section
        className="home-rise mt-2 rounded-3xl border border-zinc-200 bg-white p-4 shadow-[0_12px_40px_rgba(24,24,27,0.04)] sm:p-6"
        style={{ animationDelay: "80ms" }}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Tarefas</h2>
            <p className="mt-1 hidden text-sm text-zinc-500 md:flex">
              Crie, atualize o status e acompanhe os prazos deste projeto.
            </p>
          </div>
          <Tooltip label="Nova tarefa">
            <Button
              aria-label="Nova tarefa"
              icon={<PlusIcon className="h-5 w-5" />}
              onClick={openCreateTask}
            />
          </Tooltip>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <article className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Tarefas
            </p>
            <p className="mt-2 text-xl font-semibold tabular-nums text-zinc-900">
              {tasks.length}
            </p>
            <p className="mt-1 text-sm text-zinc-500">Neste projeto</p>
          </article>
          <article className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Abertas
            </p>
            <p className="mt-2 text-xl font-semibold tabular-nums text-zinc-900">
              {openTasks}
            </p>
            <p className="mt-1 text-sm text-zinc-500">Ainda em andamento</p>
          </article>
          <article className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Concluídas
            </p>
            <p className="mt-2 text-xl font-semibold tabular-nums text-zinc-900">
              {completedTasks}
            </p>
            <p className="mt-1 text-sm text-zinc-500">Já finalizadas</p>
          </article>
          <article className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Atrasadas
            </p>
            <p className="mt-2 text-xl font-semibold tabular-nums text-zinc-900">
              {overdueTasks}
            </p>
            <p className="mt-1 text-sm text-zinc-500">Fora do prazo combinado</p>
          </article>
        </div>

        <div className="mt-5 flex overflow-x-auto rounded-full border border-zinc-200 bg-zinc-50 p-1">
          {TASK_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTaskFilter(item.id)}
              className={`h-9 flex-1 shrink-0 rounded-full px-3 text-sm font-medium transition ${taskFilter === item.id
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {filteredTasks.length === 0 ? (
          <div className="mt-4 flex flex-col items-center px-4 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rotaract-pink/10 text-rotaract-pink">
              <ClipboardTextIcon className="h-6 w-6" weight="bold" aria-hidden />
            </span>
            <p className="mt-4 text-sm font-medium text-zinc-800">
              {tasks.length === 0
                ? "Nenhuma tarefa neste projeto."
                : "Nenhuma tarefa neste filtro."}
            </p>
            <p className="mt-1 max-w-sm text-sm text-zinc-500">
              {tasks.length === 0
                ? "Quebre o projeto em tarefas para acompanhar o que cada companheiro precisa fazer."
                : "Troque o filtro para ver o restante da lista."}
            </p>
            {tasks.length === 0 ? (
              <button
                type="button"
                onClick={openCreateTask}
                className="mt-5 text-sm font-semibold text-rotaract-pink transition hover:text-rotaract-magenta"
              >
                Cadastrar primeira tarefa
              </button>
            ) : null}
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {filteredTasks.map((task, index) => {
              const taskManager = findMember(members, task.managerId);
              const overdue = isTaskOverdue(task);
              return (
                <li
                  key={task.id}
                  className="home-rise rounded-2xl border border-zinc-100 bg-zinc-50 p-4 transition hover:-translate-y-0.5 hover:border-rotaract-pink/30 hover:bg-white hover:shadow-[0_20px_48px_rgba(255,45,122,0.10)]"
                  style={{ animationDelay: `${120 + index * 50}ms` }}
                >
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-zinc-900">{task.title}</p>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${TASK_STATUS_STYLES[task.status].selected}`}
                        >
                          {taskStatusLabel(task.status)}
                        </span>
                        {overdue ? (
                          <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">
                            Atrasada
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                        {task.description}
                      </p>
                      <p className="mt-2 text-xs text-zinc-500">
                        {taskManager
                          ? firstName(taskManager.name)
                          : "Responsável não encontrado"}
                        <span className="mx-1.5 text-zinc-300">•</span>
                        {formatDate(task.date)} até {formatDate(task.limit)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Tooltip label="Editar">
                        <button
                          type="button"
                          aria-label={`Editar ${task.title}`}
                          onClick={() => openEditTask(task)}
                          className="rounded-full p-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
                        >
                          <PencilSimpleIcon className="h-4 w-4" />
                        </button>
                      </Tooltip>
                      <Tooltip label="Excluir">
                        <button
                          type="button"
                          aria-label={`Excluir ${task.title}`}
                          onClick={() => setTaskToDelete(task)}
                          className="rounded-full p-1.5 text-zinc-400 transition hover:bg-rose-50 hover:text-rose-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {TASK_STATUS_OPTIONS.map((item) => {
                      const selected = task.status === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onChangeTaskStatus(task.id, item.id)}
                          aria-pressed={selected}
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ring-inset transition ${selected
                            ? TASK_STATUS_STYLES[item.id].selected
                            : TASK_STATUS_STYLES[item.id].chip
                            }`}
                        >
                          {selected ? (
                            <CheckIcon className="h-3 w-3" weight="bold" aria-hidden />
                          ) : null}
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <ProjectFormModal
        open={projectFormOpen}
        project={project}
        members={members}
        onClose={() => setProjectFormOpen(false)}
        onSave={onUpdateProject}
      />

      <TaskFormModal
        open={taskFormOpen}
        task={editingTask}
        members={assignableMembers.length > 0 ? assignableMembers : members}
        defaultManagerId={project.managerId}
        onClose={closeTaskForm}
        onSave={handleSaveTask}
      />

      <ConfirmModal
        open={confirmRemoveProject}
        title="Excluir projeto?"
        description={`“${project.title}” será removido do clube. As tarefas deste projeto deixam de aparecer na lista.`}
        confirmLabel="Excluir"
        onClose={() => setConfirmRemoveProject(false)}
        onConfirm={() => {
          setConfirmRemoveProject(false);
          onRemoveProject();
        }}
      />

      <ConfirmModal
        open={Boolean(taskToDelete)}
        title="Excluir tarefa?"
        description={
          taskToDelete
            ? `“${taskToDelete.title}” será removida deste projeto.`
            : undefined
        }
        confirmLabel="Excluir"
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (!taskToDelete) return;
          onRemoveTask(taskToDelete.id);
          setTaskToDelete(null);
        }}
      />
    </div>
  );
}
