"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { MemberRole, MemberStatus, digitsOnly, formatPhone, isPastDate, isValidEmail } from "../../../src/types/member";
import { MemberModalProps } from "./type";

export function useMemberModal({ member, onSave, onClose, open }: MemberModalProps) {
  const EMPTY_FORM = {
    name: "",
    email: "",
    phone: "",
    photo: "",
    birthDate: "",
    role: "Membro" as MemberRole,
    status: "ativo" as MemberStatus,
    password: "",
  };

  const nameRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(member);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

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
        }
        : EMPTY_FORM
    );
  }, [member, open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const phone = digitsOnly(form.phone);
    const birthDate = form.birthDate.trim();

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
  };
}
