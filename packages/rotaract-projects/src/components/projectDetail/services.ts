"use client";

import { findMember, membersByIds } from "../../../src/lib/members";
import { Task, TaskFilter, TaskPayload, isTaskOverdue } from "../../../src/types/tasks";
import { useEffect, useMemo, useRef, useState } from "react";
import { ProjectDetailProps, getProjectProgress, getProjectStatus, uniqueIds } from "../../../src/types/projects";
import { usePagination } from "@rotaract/components";

export function useProjectDetail({
  project,
  tasks,
  members,
  onUpdateTask,
  onCreateTask,
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

  const pagination = usePagination(filteredTasks, {
    resetKey: `${project.id}|${taskFilter}`,
  });

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

  return {
    celebrationBurst,
    celebrate,
    setCelebrate,
    status,
    setProjectFormOpen,
    setConfirmRemoveProject,
    manager,
    team,
    progress,
    openTasks,
    completedTasks,
    overdueTasks,
    filteredTasks,
    pagination,
    setTaskFilter,
    taskFilter,
    setTaskToDelete,
    editingTask,
    assignableMembers,
    openCreateTask,
    openEditTask,
    closeTaskForm,
    handleSaveTask,
    projectFormOpen,
    taskFormOpen,
    confirmRemoveProject,
    taskToDelete
  };
}
