"use client";

import {
  FloppyDiskIcon,
} from "@phosphor-icons/react";
import { Button, ConfirmModal, Loading, Main, ReturnModule, TitleModule } from "@rotaract/components";
import { ClubLogoField } from "./components/clubLogoField";
import {
  SETTINGS_INPUT_CLASS,
  ConfigPageProps,
} from "./types/settings";
import { formatBRL, formatMoneyInput } from "./services/money.services";
import { PreView } from "./components/preView";
import { useSettings } from "./services/settings.services";

export function ConfigPage({
  userName,
  backHref = "/home",
  onSaved,
}: ConfigPageProps) {
  const data = useSettings({ userName, onSaved });
  if (!data) return null;
  const {
    isLoading,
    firstName,
    clubName,
    logoUrl,
    draftFee,
    handleSubmit,
    handleLogoChange,
    setError,
    setClubName,
    feeInput,
    setFeeInput,
    error,
    dirty,
    saving,
    setDiscardOpen,
    discardOpen,
    resetTo,
    saved
  } = data;

  return (
    <Main>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {isLoading ? <Loading /> : null}

        <ReturnModule backHref={backHref} />

        <TitleModule
          module="Módulo configurações"
          title="Clube"
          description={`Olá, ${firstName}. Ajuste a identidade e o valor padrão da mensalidade.`}
        />

        <PreView
          clubName={clubName}
          logoUrl={logoUrl}
          membershipFee={Number.isFinite(draftFee) ? draftFee : 0}
        />

        <form onSubmit={handleSubmit} className="mt-5 grid gap-4 lg:grid-cols-5">
          <section className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 lg:col-span-3">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
              Identidade
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-zinc-500">
              Nome e logomarca usados na área de membros.
            </p>

            <div className="mt-6">
              <ClubLogoField
                clubName={clubName}
                logoUrl={logoUrl}
                onChange={handleLogoChange}
                onError={setError}
              />
            </div>

            <label className="mt-5 block">
              <span className="mb-1.5 block text-sm text-zinc-600">Nome do clube</span>
              <input
                value={clubName}
                onChange={(event) => setClubName(event.target.value)}
                className={SETTINGS_INPUT_CLASS}
                placeholder="Ex.: Rotaract Club Chapecó"
                maxLength={80}
                autoComplete="organization"
              />
              <span className="mt-1.5 block text-xs text-zinc-400">
                {clubName.trim().length}/80
              </span>
            </label>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
              Mensalidade
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-zinc-500">
              Valor padrão ao gerar as cobranças dos sócios.
            </p>

            <label className="mt-6 block">
              <span className="mb-1.5 block text-sm text-zinc-600">Valor da mensalidade</span>
              <span className="relative block">
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-zinc-400">
                  R$
                </span>
                <input
                  inputMode="numeric"
                  autoComplete="off"
                  value={feeInput}
                  onChange={(event) => setFeeInput(formatMoneyInput(event.target.value))}
                  className={`${SETTINGS_INPUT_CLASS} pl-12 tabular-nums`}
                  placeholder="0,00"
                />
              </span>
            </label>

            <div className="mt-5 rounded-2xl bg-rotaract-mist px-4 py-3">
              <p className="text-sm text-zinc-600">
                Cada sócio passa a ter a cobrança padrão de{" "}
                <span className="font-semibold tabular-nums text-zinc-900">
                  {Number.isFinite(draftFee) && draftFee > 0
                    ? formatBRL(draftFee)
                    : "—"}
                </span>{" "}
                por mês.
              </p>
            </div>
          </section>

          <div className="lg:col-span-5">
            {error ? (
              <p className="mb-3 text-sm text-rose-500" role="alert">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={!dirty || saving}
                onClick={() => setDiscardOpen(true)}
                className="h-12 rounded-full px-5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                Descartar
              </button>
              <Button
                type="submit"
                title={saving ? "Salvando..." : "Salvar alterações"}
                icon={<FloppyDiskIcon size={16} weight="bold" aria-hidden />}
                disabled={!dirty || saving}
              />
            </div>
          </div>
        </form>

        <ConfirmModal
          open={discardOpen}
          title="Descartar alterações?"
          description="O nome, a logomarca e o valor da mensalidade voltam para o último estado salvo nesta tela."
          confirmLabel="Descartar"
          cancelLabel="Continuar editando"
          onClose={() => setDiscardOpen(false)}
          onConfirm={() => {
            resetTo(saved);
            setDiscardOpen(false);
          }}
        />
      </main>
    </Main>
  );
}
