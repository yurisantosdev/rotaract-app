import { FormEvent, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { reloadMembers } from "@rotaract/members";
import { ClubSettings, ConfigPageProps, Setting, isImageDataUrl } from "../types/settings";
import { formatMoneyFromNumber, parseMoneyInput } from "./money.services";
import { createSettings, listSettings, updateSettings } from "./database.settings.services";
import { AlertError, AlertSuccess } from "@rotaract/components";
import { useOptionalViewingManagement } from "../components/currentManagement/viewingManagement";

export function useSettings({ userName, onSaved }: ConfigPageProps) {
  const EMPTY_SETTINGS: ClubSettings = {
    clubName: "",
    logoUrl: "",
    membershipFee: 0,
    currentManagement: "",
    managements: [],
  };

  function toClubSettings(setting: Setting): ClubSettings {
    return {
      id: setting.id,
      clubName: setting.nameClub,
      logoUrl: setting.logo,
      membershipFee: setting.valueContribution,
      currentManagement: setting.currentManagement,
      managements: setting.managements,
    };
  }

  const firstName = userName.split(" ")[0] || userName;
  const dispatch = useDispatch();
  const viewing = useOptionalViewingManagement();
  const [saved, setSaved] = useState<ClubSettings>(EMPTY_SETTINGS);
  const [clubName, setClubName] = useState("");
  const [currentManagement, setCurrentManagement] = useState("");
  const [managements, setManagements] = useState<string[]>([]);
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
    const savedManagements = saved.managements ?? [];
    const managementsChanged =
      managements.length !== savedManagements.length ||
      managements.some((item, index) => item !== savedManagements[index]);

    return (
      clubName.trim() !== saved.clubName ||
      logoUrl !== saved.logoUrl ||
      fee !== saved.membershipFee ||
      (currentManagement ?? "") !== (saved.currentManagement ?? "") ||
      managementsChanged
    );
  }, [clubName, currentManagement, draftFee, logoUrl, managements, saved]);

  function handleLogoChange(nextUrl: string) {
    setLogoUrl(nextUrl);
  }

  function resetTo(settings: ClubSettings) {
    setClubName(settings.clubName);
    handleLogoChange(settings.logoUrl);
    setFeeInput(formatMoneyFromNumber(settings.membershipFee ?? 0));
    setError("");
    setCurrentManagement(settings.currentManagement ?? "");
    setManagements(settings.managements ?? []);
  }

  async function handleCreateManagement(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;

    const settingsId = saved.id;
    if (!settingsId) {
      AlertError("Salve as configurações do clube antes de cadastrar uma gestão.");
      throw new Error("Configurações ainda não foram salvas");
    }

    const nextManagements = managements.some(
      (item) => item.toLowerCase() === trimmed.toLowerCase()
    )
      ? managements
      : [...managements, trimmed];
    const closingCurrent = Boolean(currentManagement.trim());
    const fee = saved.membershipFee ?? parseMoneyInput(feeInput);

    if (!Number.isFinite(fee) || fee <= 0 || !isImageDataUrl(saved.logoUrl)) {
      AlertError("Salve as configurações do clube antes de cadastrar uma gestão.");
      throw new Error("Configurações incompletas");
    }

    const payload = {
      valueContribution: fee,
      logo: saved.logoUrl,
      nameClub: saved.clubName,
      currentManagement: trimmed,
      managements: nextManagements,
    };

    try {
      const result = await updateSettings(
        settingsId,
        new AbortController().signal,
        payload
      );
      const next = toClubSettings(result);
      setSaved(next);
      setCurrentManagement(next.currentManagement ?? "");
      setManagements(next.managements ?? []);
      viewing?.setViewingManagement(next.currentManagement ?? trimmed);
      await dispatch(reloadMembers() as never);
      AlertSuccess(
        closingCurrent
          ? `Gestão finalizada. ${trimmed} agora é a vigente.`
          : "Gestão criada com sucesso"
      );
      onSaved(next);
    } catch (error) {
      AlertError(
        closingCurrent
          ? "Não foi possível finalizar a gestão."
          : "Não foi possível criar a gestão."
      );
      throw error;
    }
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

    if (!currentManagement.trim() || managements.length === 0) {
      setError("Cadastre ao menos uma gestão para o clube.");
      return;
    }

    setError("");
    setSaving(true);

    const payload = {
      valueContribution: fee,
      logo: logoUrl,
      nameClub: name,
      currentManagement: currentManagement,
      managements: managements,
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
    saved,
    currentManagement,
    managements,
    handleCreateManagement,
  };
}
