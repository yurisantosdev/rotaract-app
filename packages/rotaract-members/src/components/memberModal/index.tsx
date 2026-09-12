"use client";

import { Button, DatePicker, Modal } from "@rotaract/components";
import { MemberPhotoField } from "../memberPhotoField";
import {
  formatPhone,
  MEMBER_INPUT_CLASS,
  MEMBER_ROLES,
  type MemberRole,
} from "../../types/member";
import { MemberModalProps } from "./type";
import { useMemberModal } from "./services";

export function MemberModal({
  open,
  member,
  onClose,
  onSave,
}: MemberModalProps) {
  const data = useMemberModal({ member, onSave, onClose, open });
  if (!data) return null;
  const {
    nameRef,
    isEdit,
    handleSubmit,
    setForm,
    form,
    error,
    setError,
    saving,
  } = data;

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
          <div>
            <label htmlFor="member-birth-date" className="mb-1.5 block text-sm text-zinc-600">
              Data de nascimento
            </label>
            <DatePicker
              id="member-birth-date"
              value={form.birthDate}
              onChange={(birthDate) =>
                setForm((current) => ({
                  ...current,
                  birthDate,
                }))
              }
              fixedPopover
              allowClear={false}
              showToday={false}
            />
          </div>
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
