"use client";

import { Loading, Main, ReturnModule, TitleModule } from "@rotaract/components";
import { ProjectsStats } from "./components/projectsStats";
import { ProjectsPanel } from "./components/projectsPanel";
import { ProjectDetail } from "./components/projectDetail";
import { ProjectsPageProps } from "./types/projects";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useProjects } from "./services/projects.services";

export function ProjectsPage({
  userName,
  currentUserId,
  backHref = "/home",
}: ProjectsPageProps) {

  const data = useProjects(userName);
  if (!data) return null;
  const {
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
  } = data;
  return (
    <Main>
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
                description={selected.description}
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
    </Main>
  );
}
