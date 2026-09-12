"use client";

import { Button, DatePicker, Modal } from "@rotaract/components";
import {
  PROJECT_INPUT_CLASS,
  PROJECT_TEXTAREA_CLASS,
} from "../../types/projects";
import {
  TASK_STATUS_OPTIONS,
} from "../../types/tasks";
import { MemberPicker } from "../memberPicker";
import { TaskFormModalProps } from "./type";
import { useTaskFormModal } from "./services";

export function TaskFormModal({
  open,
  task,
  members,
  defaultManagerId,
  onClose,
  onSave,
}: TaskFormModalProps) {
  const data = useTaskFormModal({
    task,
    members,
    defaultManagerId,
    onClose,
    onSave,
    open
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
    date,
    setDate,
    limit,
    setLimit,
    status,
    setStatus,
    error,
    saving,
    handleSubmit
  } = data;

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Tarefas"
      title={isEdit ? "Editar tarefa" : "Nova tarefa"}
      description={
        isEdit
          ? "Atualize o responsável, o prazo e o andamento desta tarefa."
          : "Cadastre uma tarefa para acompanhar o que ainda falta no projeto."
      }
      initialFocusRef={titleRef}
      size="lg"
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[min(72vh,40rem)] overflow-y-auto px-5 py-5 sm:px-6"
      >
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-rotaract-mist p-1 sm:grid-cols-5">
          {TASK_STATUS_OPTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStatus(item.id)}
              className={`h-11 rounded-[1.1rem] px-2 text-sm font-semibold transition ${status === item.id
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-sm text-zinc-600">Título</span>
          <input
            ref={titleRef}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={PROJECT_INPUT_CLASS}
            placeholder="Ex.: Divulgar nas redes do clube"
            maxLength={80}
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm text-zinc-600">Descrição</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={PROJECT_TEXTAREA_CLASS}
            placeholder="O que precisa ser feito e qualquer recado para o responsável"
            maxLength={400}
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="task-date" className="mb-1.5 block text-sm text-zinc-600">
              Data
            </label>
            <DatePicker
              id="task-date"
              value={date}
              onChange={setDate}
              fixedPopover
              allowClear={false}
            />
          </div>
          <div>
            <label htmlFor="task-limit" className="mb-1.5 block text-sm text-zinc-600">
              Prazo
            </label>
            <DatePicker
              id="task-limit"
              value={limit}
              onChange={setLimit}
              baseDate={date}
              fixedPopover
              allowClear={false}
            />
          </div>
        </div>

        <div className="mt-5">
          <MemberPicker
            members={members}
            selectedIds={managerId ? [managerId] : []}
            onChange={(ids) => setManagerId(ids[0] ?? "")}
            mode="single"
            label="Membro responsável"
            hint={
              managerId
                ? "Quem conduz esta tarefa"
                : "Escolha um companheiro responsável"
            }
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
                  : "Cadastrar tarefa"
            }
          />
        </div>
      </form>
    </Modal>
  );
}
