import { FormEvent, useEffect, useMemo, useState } from "react";
import { ClubSettings, ConfigPageProps, Setting, isImageDataUrl } from "../types/settings";
import { formatMoneyFromNumber, parseMoneyInput } from "./money.services";
import { createSettings, listSettings, updateSettings } from "./database.settings.services";
import { AlertError, AlertSuccess } from "@rotaract/components";

export function useSettings({ userName, onSaved }: ConfigPageProps) {
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

  const firstName = userName.split(" ")[0] || userName;
  const [saved, setSaved] = useState<ClubSettings>(EMPTY_SETTINGS);
  const [clubName, setClubName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [feeInput, setFeeInput] = useState(
    formatMoneyFromNumber(0)
  );
  const [error, setError] = useState("");
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
      return;
    }

    if (!Number.isFinite(fee) || fee <= 0) {
      setError("Informe um valor de mensalidade maior que zero.");
      return;
    }

    if (!isImageDataUrl(logoUrl)) {
      setError("Envie uma logomarca em PNG, JPG ou WEBP.");
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
      AlertSuccess("Configurações salvas com sucesso");
      onSaved(next);
    } catch {
      AlertError("Não foi possível salvar as configurações.");
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

  return {
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
  };
}
