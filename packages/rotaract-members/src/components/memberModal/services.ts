"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { MemberRole, MemberStatus, digitsOnly, formatPhone, isPastDate, isValidEmail, uniqueMemberManagements } from "../../../src/types/member";
import { MemberModalProps } from "./type";

type ClubManagements = {
  currentManagement: string;
  managements: string[];
};

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  photo: "",
  birthDate: "",
  role: "Membro" as MemberRole,
  status: "ativo" as MemberStatus,
  password: "",
  managements: [] as string[],
};

async function loadClubManagements(signal: AbortSignal): Promise<ClubManagements> {
  const response = await fetch("/api/settings", {
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar as gestões do clube");
  }

  const data: unknown = await response.json();
  const row =
    Array.isArray(data) && data[0] && typeof data[0] === "object"
      ? (data[0] as Record<string, unknown>)
      : null;

  const currentManagement =
    typeof row?.currentManagement === "string"
      ? row.currentManagement.trim()
      : "";
  const fromSettings = Array.isArray(row?.managements)
    ? row.managements.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0
      ).map((item) => item.trim())
    : [];

  const names = new Set<string>(fromSettings);
  if (currentManagement) names.add(currentManagement);

  return {
    currentManagement,
    managements: [...names].sort((a, b) => a.localeCompare(b, "pt-BR")),
  };
}

function mergeManagementOptions(
  settingsManagements: string[],
  memberManagements: string[]
): string[] {
  const names = new Set<string>([...settingsManagements, ...memberManagements]);
  return [...names].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function useMemberModal({ member, onSave, onClose, open }: MemberModalProps) {
  const nameRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(member);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [managementOptions, setManagementOptions] = useState<string[]>([]);
  const [currentManagement, setCurrentManagement] = useState("");

  useEffect(() => {
    if (!open) return;

    const memberManagements = uniqueMemberManagements(member ? [member] : []);

    setError("");
    setSaving(false);
    setForm(
      member
        ? {
            name: member.name,
            email: member.email,
            phone: formatPhone(member.phone ?? ""),
            photo: member.photo ?? "",
            birthDate: member.birthDate ?? "",
            role: member.role,
            status: member.status,
            password: "",
            managements: memberManagements,
          }
        : EMPTY_FORM
    );

    const controller = new AbortController();

    loadClubManagements(controller.signal)
      .then((club) => {
        const options = mergeManagementOptions(
          club.managements,
          memberManagements
        );
        setCurrentManagement(club.currentManagement);
        setManagementOptions(options);
        setForm((current) => ({
          ...current,
          managements: member
            ? options.filter((item) => memberManagements.includes(item))
            : club.currentManagement && options.includes(club.currentManagement)
              ? [club.currentManagement]
              : [],
        }));
      })
      .catch((caught: unknown) => {
        if (caught instanceof DOMException && caught.name === "AbortError") {
          return;
        }
        setError(
          caught instanceof Error
            ? caught.message
            : "Não foi possível carregar as gestões do clube."
        );
      });

    return () => controller.abort();
  }, [member, open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const phone = digitsOnly(form.phone);
    const birthDate = form.birthDate.trim();
    const managements = form.managements.filter((item) =>
      managementOptions.includes(item)
    );

    if (name.length < 3) {
      setError("Informe o nome completo com pelo menos 3 caracteres.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Informe um e-mail válido.");
      return;
    }

    if (phone.length < 10) {
      setError("Informe um telefone válido com DDD.");
      return;
    }

    if (!birthDate) {
      setError("Informe a data de nascimento.");
      return;
    }

    if (!isPastDate(birthDate)) {
      setError("A data de nascimento precisa ser anterior a hoje.");
      return;
    }

    if (!isEdit && form.password.length < 6) {
      setError("A senha de acesso precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (managements.length === 0) {
      setError("Selecione ao menos uma gestão de acesso.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave({
        name,
        email,
        phone,
        photo: form.photo,
        birthDate,
        role: form.role,
        status: form.status,
        password: isEdit ? undefined : form.password,
        managements,
      });
      onClose();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível salvar o membro."
      );
    } finally {
      setSaving(false);
    }
  }

  return {
    EMPTY_FORM,
    nameRef,
    isEdit,
    handleSubmit,
    setForm,
    form,
    error,
    setError,
    saving,
    managementOptions,
    currentManagement,
  };
}
