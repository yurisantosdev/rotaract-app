"use client";

import { CaretDownIcon, ChecksIcon, PlusIcon } from "@phosphor-icons/react";
import { AlertSuccess, Button } from "@rotaract/components";
import { SETTINGS_INPUT_CLASS } from "../../types/settings";
import { NewManagementModal } from "./newManagementModal";
import { useCurrentManagement } from "./services";
import { CurrentManagementProps } from "./type";

export function CurrentManagement({
  currentManagement,
  managements,
  onCreateManagement,
}: CurrentManagementProps) {
  const data = useCurrentManagement({
    currentManagement,
    managements,
    onCreateManagement,
  });
  if (!data) return null;
  const {
    viewingManagement,
    viewingOptions,
    setViewingManagement,
    modalOpen,
    setModalOpen,
    isViewingCurrent,
    handleCreate,
  } = data;

  const hasManagements = viewingOptions.length > 0;

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
        Gestão
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-zinc-500">
        A vigente aparece no clube. Outra gestão pode ser visualizada só nesta sessão.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <div>
          {currentManagement ? (
            <p className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              Vigente: {currentManagement}
            </p>
          ) : (
            <p className="text-sm text-zinc-500">
              Nenhuma gestão vigente cadastrada.
            </p>
          )}
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm text-zinc-600">
            Visualizar gestão
          </span>
          <span className="relative block">
            <select
              value={
                hasManagements && viewingOptions.includes(viewingManagement)
                  ? viewingManagement
                  : ""
              }
              onChange={(event) => {
                setViewingManagement(event.target.value)
                const title = `Gestão alterada para ${event.target.value}`
                AlertSuccess(title)
              }}
              disabled={!hasManagements}
              className={`${SETTINGS_INPUT_CLASS} cursor-pointer appearance-none pr-10 disabled:cursor-not-allowed disabled:opacity-60`}
              aria-label="Gestão para visualização"
            >
              {hasManagements ? (
                viewingOptions.map((management) => (
                  <option key={management} value={management}>
                    {management === currentManagement
                      ? `${management} (atual)`
                      : management}
                  </option>
                ))
              ) : (
                <option value="">Nenhuma gestão</option>
              )}
            </select>
            <CaretDownIcon
              className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400"
              weight="bold"
              aria-hidden
            />
          </span>
          {hasManagements ? (
            <p className="mt-1.5 text-xs text-zinc-400">
              {isViewingCurrent
                ? "Você está visualizando a gestão vigente."
                : `Visualização de ${viewingManagement}. A gestão atual continua sendo ${currentManagement}.`}
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-zinc-400">
              Só aparecem gestões do seu cadastro de membro.
            </p>
          )}
        </label>

        <Button
          title={currentManagement ? "Finalizar gestão" : "Nova gestão"}
          className="w-full"
          icon={
            currentManagement ? (
              <ChecksIcon size={16} weight="bold" aria-hidden />
            ) : (
              <PlusIcon size={16} weight="bold" aria-hidden />
            )
          }
          onClick={() => setModalOpen(true)}
        />
      </div>

      <NewManagementModal
        open={modalOpen}
        existingNames={managements}
        currentManagement={currentManagement}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
      />
    </section>
  );
}
