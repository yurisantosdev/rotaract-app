"use client";

import { Button, Modal } from "@rotaract/components";
import {
  PROJECT_INPUT_CLASS,
  PROJECT_TEXTAREA_CLASS,
} from "../../types/projects";
import { MemberPicker } from "../memberPicker";
import { ProjectFormModalProps } from "./type";
import { useProjectFormModal } from "./services";

export function ProjectFormModal({
  open,
  project,
  members,
  currentUserId,
  onClose,
  onSave,
}: ProjectFormModalProps) {
  const data = useProjectFormModal({
    open,
    project,
    members,
    currentUserId,
    onClose,
    onSave
  });
  if (!data) return null;
  const {
    titleRef,
    isEdit,
    title,
    setTitle,
    description,
    setDescription,
    managerId,
    setManagerId,
    memberIds,
    setMemberIds,
    error,
    saving,
    handleSubmit,
    handleManagerChange
  } = data;


  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Projetos"
      title={isEdit ? "Editar projeto" : "Novo projeto"}
      description={
        isEdit
          ? "Atualize o título, a descrição, o responsável e a equipe envolvida."
          : "Cadastre um projeto do clube e escolha quem conduz e quem participa."
      }
      initialFocusRef={titleRef}
      size="lg"
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[min(72vh,40rem)] overflow-y-auto px-5 py-5 sm:px-6"
      >
        <label className="block">
          <span className="mb-1.5 block text-sm text-zinc-600">Título</span>
          <input
            ref={titleRef}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={PROJECT_INPUT_CLASS}
            placeholder="Ex.: Campanha do Agasalho"
            maxLength={80}
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm text-zinc-600">Descrição</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={PROJECT_TEXTAREA_CLASS}
            placeholder="Objetivo, público e o que o clube vai realizar"
            maxLength={600}
          />
        </label>

        <div className="mt-5">
          <MemberPicker
            members={members}
            selectedIds={managerId ? [managerId] : []}
            onChange={handleManagerChange}
            mode="single"
            label="Membro responsável"
            hint={
              managerId
                ? "Quem conduz o projeto no clube"
                : "Escolha um companheiro responsável"
            }
          />
        </div>

        <div className="mt-5">
          <MemberPicker
            members={members}
            selectedIds={memberIds}
            onChange={setMemberIds}
            label="Membros envolvidos"
            lockedIds={managerId ? [managerId] : []}
          />
        </div>

        {error ? (
          <p className="mt-4 text-sm text-rose-500" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-12 rounded-full px-5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cancelar
          </button>
          <Button
            type="submit"
            loading={saving}
            title={
              saving
                ? "Salvando..."
                : isEdit
                  ? "Salvar alterações"
                  : "Cadastrar projeto"
            }
          />
        </div>
      </form>
    </Modal>
  );
}
