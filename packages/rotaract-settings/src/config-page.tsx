"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CheckCircleIcon,
  FloppyDiskIcon,
} from "@phosphor-icons/react";
import { Button, ConfirmModal, Loading, ReturnModule, TitleModule } from "@rotaract/components";
import { ClubLogoField } from "./components/club-logo-field";

import {
  SETTINGS_INPUT_CLASS,
  isImageDataUrl,
  type ClubSettings,
  type Setting,
} from "./types/settings";
import { formatBRL, formatMoneyFromNumber, formatMoneyInput, parseMoneyInput } from "./services/money";
import { PreView } from "./components/preView";
import { createSettings, listSettings, updateSettings } from "./services/settings";

export type ConfigPageProps = {
  userName: string;
  backHref?: string;
  onSaved?: (settings: ClubSettings) => void;
};

const EMPTY_SETTINGS: ClubSettings = {
  clubName: "",
  logoUrl: "",
  membershipFee: 0,
};

function toClubSettings(setting: Setting): ClubSettings {
  return {
    id: setting.id,
    clubName: setting.nameClub,
    logoUrl: setting.logo,
    membershipFee: setting.valueContribution,
  };
}

export function ConfigPage({
  userName,
  backHref = "/home",
  onSaved,
}: ConfigPageProps) {
  const firstName = userName.split(" ")[0] || userName;
  const [saved, setSaved] = useState<ClubSettings>(EMPTY_SETTINGS);
  const [clubName, setClubName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [feeInput, setFeeInput] = useState(
    formatMoneyFromNumber(0)
  );
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const draftFee = parseMoneyInput(feeInput);
  const dirty = useMemo(() => {
    const fee = Number.isFinite(draftFee) ? draftFee : -1;
    return (
      clubName.trim() !== saved.clubName ||
      logoUrl !== saved.logoUrl ||
      fee !== saved.membershipFee
    );
  }, [clubName, draftFee, logoUrl, saved]);

  function handleLogoChange(nextUrl: string) {
    setLogoUrl(nextUrl);
  }

  function resetTo(settings: ClubSettings) {
    setClubName(settings.clubName);
    handleLogoChange(settings.logoUrl);
    setFeeInput(formatMoneyFromNumber(settings.membershipFee));
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = clubName.trim();
    const fee = parseMoneyInput(feeInput);

    if (name.length < 3) {
      setError("Informe o nome do clube com pelo menos 3 caracteres.");
      setNotice("");
      return;
    }

    if (!Number.isFinite(fee) || fee <= 0) {
      setError("Informe um valor de mensalidade maior que zero.");
      setNotice("");
      return;
    }

    if (!isImageDataUrl(logoUrl)) {
      setError("Envie uma logomarca em PNG, JPG ou WEBP.");
      setNotice("");
      return;
    }

    setError("");
    setSaving(true);

    const payload = {
      valueContribution: fee,
      logo: logoUrl,
      nameClub: name,
    };

    try {
      const result = saved.id
        ? await updateSettings(saved.id, new AbortController().signal, payload)
        : await createSettings(new AbortController().signal, payload);
      const next = toClubSettings(result);
      setSaved(next);
      setClubName(next.clubName);
      setNotice("Configurações salvas.");
      onSaved?.(next);
    } catch {
      setError("Não foi possível salvar as configurações.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    listSettings(controller.signal)
      .then((items) => {
        const current = items[0];
        const next = current ? toClubSettings(current) : EMPTY_SETTINGS;
        setSaved(next);
        resetTo(next);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setSaved(EMPTY_SETTINGS);
      }).finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  return (
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
          {notice && !error ? (
            <p
              className="mb-3 inline-flex items-center gap-1.5 text-sm text-emerald-700"
              role="status"
            >
              <CheckCircleIcon size={16} weight="fill" aria-hidden />
              {notice}
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
          setNotice("");
          setDiscardOpen(false);
        }}
      />
    </main>
  );
}
