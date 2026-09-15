"use client";

import { Loading, Main, ReturnModule, TitleModule } from "@rotaract/components";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { PautasStats } from "./components/pautasStats";
import { PautasPanel } from "./components/pautasPanel";
import { PautaDetail } from "./components/pautaDetail";
import type { PautasPageProps } from "./types/pautas";
import { usePautas } from "./services/pautas.services";

export function PautasPage({
  userName,
  currentUserId,
  backHref = "/home",
}: PautasPageProps) {
  const data = usePautas(userName);
  if (!data) return null;
  const {
    firstName,
    pautas,
    selected,
    setSelectedId,
    isLoading,
    loadError,
    members,
    generatingPdf,
    downloadingPdf,
    canImportPendingItems,
    handleCreatePauta,
    handleUpdatePauta,
    handleRemovePauta,
    handleDuplicatePauta,
    handleCreateItem,
    handleUpdateItem,
    handleChangeItemStatus,
    handleRemoveItem,
    handleMoveItem,
    handleImportPendingItems,
    handleGeneratePdf,
    handleDownloadPdf,
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
                module="Módulo pautas"
                title={selected.title}
              />
            </div>
          </div>
        ) : (
          <div>
            <ReturnModule backHref={backHref} />

            <TitleModule
              module="Módulo pautas"
              title="Pautas"
              description={`Olá, ${firstName}. Gerencie as pautas do clube.`}
            />
          </div>
        )}

        {loadError ? (
          <p className="mt-5 text-sm text-rose-700" role="alert">
            {loadError}
          </p>
        ) : null}

        {selected ? (
          <PautaDetail
            pauta={selected}
            members={members}
            onUpdatePauta={handleUpdatePauta}
            onRemovePauta={handleRemovePauta}
            onDuplicatePauta={handleDuplicatePauta}
            onCreateItem={handleCreateItem}
            onUpdateItem={handleUpdateItem}
            onChangeItemStatus={handleChangeItemStatus}
            onRemoveItem={handleRemoveItem}
            onMoveItem={handleMoveItem}
            onImportPendingItems={handleImportPendingItems}
            canImportPendingItems={canImportPendingItems}
            onGeneratePdf={handleGeneratePdf}
            onDownloadPdf={handleDownloadPdf}
            generatingPdf={generatingPdf}
            downloadingPdf={downloadingPdf}
          />
        ) : (
          <>
            <PautasStats pautas={pautas} />
            <PautasPanel
              pautas={pautas}
              members={members}
              currentUserId={currentUserId}
              onOpen={setSelectedId}
              onCreate={handleCreatePauta}
            />
          </>
        )}
      </main>
    </Main>
  );
}
