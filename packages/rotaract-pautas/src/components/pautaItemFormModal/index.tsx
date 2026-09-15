"use client";

import { Button, Modal } from "@rotaract/components";
import {
  PAUTA_INPUT_CLASS,
  PAUTA_TEXTAREA_CLASS,
} from "../../types/pautas";
import { PAUTA_ITEM_STATUS_OPTIONS } from "../../types/pautaItems";
import { MemberPicker } from "../memberPicker";
import type { PautaItemFormModalProps } from "./type";
import { usePautaItemFormModal } from "./services";

export function PautaItemFormModal({
  open,
  item,
  members,
  defaultResponsibleId,
  onClose,
  onSave,
}: PautaItemFormModalProps) {
  const data = usePautaItemFormModal({
    open,
    item,
    members,
    defaultResponsibleId,
    onClose,
    onSave,
  });
  if (!data) return null;
  const {
    titleRef,
    isEdit,
    title,
    setTitle,
    description,
    setDescription,
    responsibleId,
    setResponsibleId,
    status,
    setStatus,
    error,
    saving,
    handleSubmit,
  } = data;

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Itens da pauta"
      title={isEdit ? "Editar item" : "Novo item"}
      description={
        isEdit
          ? "Atualize o assunto, o responsável e o andamento deste item."
          : "Cadastre um assunto discutido na reunião e o companheiro responsável."
      }
      initialFocusRef={titleRef}
      size="lg"
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[min(72vh,40rem)] overflow-y-auto px-5 py-5 sm:px-6"
      >
        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-rotaract-mist p-1">
          {PAUTA_ITEM_STATUS_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setStatus(option.id)}
              className={`h-11 rounded-[1.1rem] px-2 text-sm font-semibold transition ${
                status === option.id
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-sm text-zinc-600">Título</span>
          <input
            ref={titleRef}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={PAUTA_INPUT_CLASS}
            placeholder="Ex.: Informe da tesouraria"
            maxLength={80}
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm text-zinc-600">Descrição</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={PAUTA_TEXTAREA_CLASS}
            placeholder="O que será discutido e qualquer recado para o responsável"
            maxLength={400}
          />
        </label>

        <div className="mt-5">
          <MemberPicker
            members={members}
            selectedIds={responsibleId ? [responsibleId] : []}
            onChange={(ids) => setResponsibleId(ids[0] ?? "")}
            mode="single"
            label="Membro responsável"
            hint={
              responsibleId
                ? "Quem conduz este item na reunião"
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
                  : "Cadastrar item"
            }
          />
        </div>
      </form>
    </Modal>
  );
}
