"use client";

import { AlertError, AlertSuccess } from "@rotaract/components";
import { useMembers, useMembersStatus } from "@rotaract/members";
import { useViewingManagement } from "@rotaract/settings";
import { useEffect, useState } from "react";
import { Project, ProjectPayload } from "../types/projects";
import { Task, TaskPayload, TaskStatus } from "../types/tasks";
import { createProjects, createTasks, listProjects, listTasks, removeProjects, removeTasks, updateProjects, updateTasks } from "./database.projects.services";

export function useProjects(userName: string) {
  const members = useMembers();
  const membersStatus = useMembersStatus();
  const { viewingManagement, viewingOptions } = useViewingManagement();
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
    setSelectedId(null);
  }, [viewingManagement]);

  useEffect(() => {
    if (!viewingManagement) {
      const waitingForViewing =
        membersStatus === "idle" ||
        membersStatus === "loading" ||
        viewingOptions.length > 0;

      if (waitingForViewing) {
        setIsLoadingProjects(true);
        return;
      }

      setProjects([]);
      setTasks([]);
      setLoadError("");
      setIsLoadingProjects(false);
      return;
    }

    const controller = new AbortController();
    setIsLoadingProjects(true);

    void Promise.all([
      listProjects(controller.signal, viewingManagement),
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
  }, [membersStatus, viewingManagement, viewingOptions.length]);

  function handleCreateProject(payload: ProjectPayload) {
    const controller = new AbortController();

    return createProjects(controller.signal, payload).then((created) => {
      if (created.management === viewingManagement) {
        setProjects((current) => [created, ...current]);
        setSelectedId(created.id);
      }
      setLoadError("");
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
        AlertSuccess("Projeto excluído com sucesso");
        setLoadError("");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        AlertError("Não foi possível excluir o projeto.");
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
        AlertSuccess("Tarefa excluída com sucesso");
        setLoadError("");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        AlertError("Não foi possível excluir a tarefa.");
        setLoadError(
          error instanceof Error
            ? error.message
            : "Não foi possível excluir a tarefa."
        );
      });
  }

  return {
    projects,
    tasks,
    selected,
    selectedTasks,
    setSelectedId,
    isLoading,
    loadError,
    handleUpdateProject,
    handleRemoveProject,
    handleCreateTask,
    handleUpdateTask,
    handleChangeTaskStatus,
    handleRemoveTask,
    members,
    handleCreateProject
  };
}
