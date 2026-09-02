"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Button, Modal } from "@rotaract/components";
import { MemberPhotoField } from "./member-photo-field";
import {
  digitsOnly,
  formatPhone,
  isPastDate,
  isValidEmail,
  MEMBER_INPUT_CLASS,
  MEMBER_ROLES,
  type Member,
  type MemberPayload,
  type MemberRole,
  type MemberStatus,
} from "../types/member";

type MemberModalProps = {
  open: boolean;
  member: Member | null;
  onClose: () => void;
  onSave: (payload: MemberPayload) => void | Promise<void>;
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
};

export function MemberModal({
  open,
  member,
  onClose,
  onSave,
}: MemberModalProps) {
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

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Membros"
      title={isEdit ? "Editar membro" : "Novo membro"}
      description={
        isEdit
          ? "Atualize foto, contato, aniversário, cargo e a situação no clube."
          : "Cadastre um companheiro com acesso ao aplicativo. Ele aparece na lista e nas cobranças da tesouraria."
      }
      initialFocusRef={nameRef}
      size="lg"
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[min(72vh,40rem)] overflow-y-auto px-5 py-5 sm:px-6"
      >
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-rotaract-mist p-1">
          {(
            [
              ["ativo", "Ativo"],
              ["inativo", "Inativo"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm((current) => ({ ...current, status: value }))}
              className={`h-11 rounded-[1.1rem] text-sm font-semibold transition ${form.status === value
                ? value === "ativo"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "bg-white text-zinc-700 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <MemberPhotoField
            name={form.name}
            photoUrl={form.photo}
            onChange={(photo) =>
              setForm((current) => ({ ...current, photo }))
            }
            onError={setError}
          />
        </div>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-sm text-zinc-600">Nome completo</span>
          <input
            ref={nameRef}
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            className={MEMBER_INPUT_CLASS}
            placeholder="Ex.: Ana Clara Souza"
            autoComplete="name"
            maxLength={80}
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-sm text-zinc-600">E-mail</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              className={MEMBER_INPUT_CLASS}
              placeholder="nome@clube.org"
              autoComplete="email"
            />
          </label>
          <label>
            <span className="mb-1.5 block text-sm text-zinc-600">Telefone</span>
            <input
              type="tel"
              inputMode="numeric"
              value={form.phone}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  phone: formatPhone(event.target.value),
                }))
              }
              className={MEMBER_INPUT_CLASS}
              placeholder="(49) 99999-0000"
              autoComplete="tel"
              maxLength={16}
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-sm text-zinc-600">
              Data de nascimento
            </span>
            <input
              type="date"
              value={form.birthDate}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  birthDate: event.target.value,
                }))
              }
              className={MEMBER_INPUT_CLASS}
            />
          </label>
          <label>
            <span className="mb-1.5 block text-sm text-zinc-600">Cargo no clube</span>
            <select
              value={form.role}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  role: event.target.value as MemberRole,
                }))
              }
              className={MEMBER_INPUT_CLASS}
            >
              {MEMBER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
        </div>

        {isEdit ? null : (
          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm text-zinc-600">Senha de acesso</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              className={MEMBER_INPUT_CLASS}
              placeholder="Mínimo de 6 caracteres"
              autoComplete="new-password"
            />
          </label>
        )}

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
                  : "Cadastrar membro"
            }
          />
        </div>
      </form>
    </Modal>
  );
}
