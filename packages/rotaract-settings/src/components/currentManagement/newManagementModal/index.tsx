"use client";

import { Button, Modal } from "@rotaract/components";
import { SETTINGS_INPUT_CLASS } from "../../../types/settings";
import { NewManagementModalProps } from "./type";
import { useNewManagementModal } from "./services";

export function NewManagementModal({
  open,
  existingNames,
  currentManagement,
  onClose,
  onCreate,
}: NewManagementModalProps) {
  const data = useNewManagementModal({
    open,
    existingNames,
    currentManagement,
    onClose,
    onCreate,
  });
  if (!data) return null;
  const { nameRef, name, setName, error, saving, isClosing, handleSubmit } =
    data;

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Configurações"
      title={isClosing ? "Finalizar gestão" : "Nova gestão"}
      description={
        isClosing
          ? `A gestão ${currentManagement} deixa de ser a vigente. Informe o nome da nova gestão: ela passa a ser a atual. As gestões anteriores continuam disponíveis para visualização.`
          : "Vamos criar uma nova gestão para o clube. Informe o nome que ela deve receber."
      }
      initialFocusRef={nameRef}
    >
      <form onSubmit={handleSubmit} className="px-5 py-5 sm:px-6">
        {isClosing ? (
          <div className="mb-5 rounded-2xl bg-rotaract-mist px-4 py-3">
            <p className="text-sm leading-relaxed text-zinc-600">
              <span className="font-semibold text-zinc-900">
                {currentManagement}
              </span>{" "}
              será encerrada. A nova gestão se torna a vigente. Você ainda pode
              visualizar as anteriores no seletor.
            </p>
          </div>
        ) : null}

        <label className="block">
          <span className="mb-1.5 block text-sm text-zinc-600">
            Nova gestão
          </span>
          <input
            ref={nameRef}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={SETTINGS_INPUT_CLASS}
            placeholder="Informe o nome da nova gestão"
            maxLength={40}
            autoComplete="off"
          />
        </label>

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
                ? isClosing
                  ? "Finalizando..."
                  : "Criando..."
                : isClosing
                  ? "Finalizar e criar"
                  : "Criar gestão"
            }
          />
        </div>
      </form>
    </Modal>
  );
}
