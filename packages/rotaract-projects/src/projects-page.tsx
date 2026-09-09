"use client";

import { useEffect, useState } from "react";
import { Loading, ReturnModule, TitleModule } from "@rotaract/components";
import { useMembers, useMembersStatus } from "@rotaract/members";
import { ProjectsStats } from "./components/projects-stats";
import { ProjectsPanel } from "./components/projects-panel";
import { ProjectDetail } from "./components/project-detail";
import {
  listProjects,
  createProjects,
  updateProjects,
  removeProjects,
  listTasks,
  createTasks,
  updateTasks,
  removeTasks,
} from "./services/projects";
import { type Project, type ProjectPayload, ProjectsPageProps } from "./types/projects";
import type { Task, TaskPayload, TaskStatus } from "./types/tasks";
import { ArrowLeftIcon } from "@phosphor-icons/react";

export function ProjectsPage({
  userName,
  currentUserId,
  backHref = "/home",
}: ProjectsPageProps) {
  const members = useMembers();
  const membersStatus = useMembersStatus();
  const firstName = userName.split(" ")[0] || userName;
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState("");
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const isLoading =
    isLoadingProjects ||
    membersStatus === "idle" ||
    membersStatus === "loading";
  const selected = projects.find((project) => project.id === selectedId) ?? null;
  const selectedTasks = tasks.filter((task) => task.projectId === selected?.id);

  useEffect(() => {
    const controller = new AbortController();

    void Promise.all([
      listProjects(controller.signal),
      listTasks(controller.signal),
    ])
      .then(([projectList, taskList]) => {
        if (controller.signal.aborted) return;
        setProjects(projectList);
        setTasks(taskList);
        setLoadError("");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setProjects([]);
        setTasks([]);
        setLoadError("Não foi possível carregar os projetos e as tarefas.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingProjects(false);
        }
      });

    return () => controller.abort();
  }, []);

  function handleCreateProject(payload: ProjectPayload) {
    const controller = new AbortController();

    return createProjects(controller.signal, payload).then((created) => {
      setProjects((current) => [created, ...current]);
      setLoadError("");
      setSelectedId(created.id);
    });
  }

  function handleUpdateProject(payload: ProjectPayload) {
    if (!selected) return Promise.resolve();

    const controller = new AbortController();

    return updateProjects(selected.id, controller.signal, payload).then((updated) => {
      setProjects((current) =>
        current.map((project) => (project.id === updated.id ? updated : project))
      );
      setLoadError("");
    });
  }

  function handleRemoveProject() {
    if (!selected) return Promise.resolve();

    const projectId = selected.id;
    const controller = new AbortController();

    return removeProjects(projectId, controller.signal)
      .then(() => {
        setProjects((current) => current.filter((project) => project.id !== projectId));
        setTasks((current) => current.filter((task) => task.projectId !== projectId));
        setSelectedId(null);
        setLoadError("");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setLoadError(
          error instanceof Error
            ? error.message
            : "Não foi possível excluir o projeto."
        );
      });
  }

  function handleCreateTask(payload: TaskPayload) {
    if (!selected) return Promise.resolve();

    const controller = new AbortController();

    return createTasks(controller.signal, {
      ...payload,
      projectId: selected.id,
    }).then((created) => {
      setTasks((current) => [created, ...current]);
      setLoadError("");
    });
  }

  function handleUpdateTask(taskId: string, payload: TaskPayload) {
    const current = tasks.find((task) => task.id === taskId);
    if (!current) return Promise.resolve();

    const controller = new AbortController();

    return updateTasks(taskId, controller.signal, {
      ...payload,
      projectId: current.projectId,
    }).then((updated) => {
      setTasks((items) =>
        items.map((task) => (task.id === updated.id ? updated : task))
      );
      setLoadError("");
    });
  }

  function handleChangeTaskStatus(taskId: string, status: TaskStatus) {
    const current = tasks.find((task) => task.id === taskId);
    if (!current || current.status === status) return Promise.resolve();

    const controller = new AbortController();

    return updateTasks(taskId, controller.signal, {
      title: current.title,
      description: current.description,
      managerId: current.managerId,
      projectId: current.projectId,
      date: current.date,
      status,
      limit: current.limit,
    })
      .then((updated) => {
        setTasks((items) =>
          items.map((task) => (task.id === updated.id ? updated : task))
        );
        setLoadError("");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setLoadError(
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar o status da tarefa."
        );
      });
  }

  function handleRemoveTask(taskId: string) {
    const controller = new AbortController();

    return removeTasks(taskId, controller.signal)
      .then(() => {
        setTasks((current) => current.filter((task) => task.id !== taskId));
        setLoadError("");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setLoadError(
          error instanceof Error
            ? error.message
            : "Não foi possível excluir a tarefa."
        );
      });
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {isLoading ? <Loading /> : null}

      {selected ? (
        <div className="flex items-center justify-start gap-4">
          <div
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-rotaract-pink p-2 hover:bg-rotaract-pink/10"
            onClick={() => setSelectedId(null)}
          >
            <ArrowLeftIcon size={24} className="text-rotaract-pink" />
          </div>

          <div className="-mt-6 min-w-0">
            <TitleModule
              module="Módulo projetos"
              title={selected.title}
            />
          </div>
        </div>
      ) : (
        <div>
          <ReturnModule backHref={backHref} />

          <TitleModule
            module="Módulo projetos"
            title="Projetos"
            description="Organize as ações do clube, os companheiros envolvidos e o andamento de cada tarefa."
          />
        </div>
      )}

      {loadError ? (
        <p className="mt-5 text-sm text-rose-700" role="alert">
          {loadError}
        </p>
      ) : null}

      {selected ? (
        <ProjectDetail
          project={selected}
          tasks={selectedTasks}
          members={members}
          onUpdateProject={handleUpdateProject}
          onRemoveProject={handleRemoveProject}
          onCreateTask={handleCreateTask}
          onUpdateTask={handleUpdateTask}
          onChangeTaskStatus={handleChangeTaskStatus}
          onRemoveTask={handleRemoveTask}
        />
      ) : (
        <>
          <ProjectsStats projects={projects} tasks={tasks} />
          <ProjectsPanel
            projects={projects}
            tasks={tasks}
            members={members}
            currentUserId={currentUserId}
            onOpen={setSelectedId}
            onCreate={handleCreateProject}
          />
        </>
      )}
    </main>
  );
}
