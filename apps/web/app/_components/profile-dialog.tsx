"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@rotaract/components";
import {
  isValidEmail,
  MEMBER_INPUT_CLASS,
  MemberPhotoField,
  membersUpdate,
  updateMembers,
  useMembers,
  useMembersStatus,
} from "@rotaract/members";
import type { AuthUser } from "../lib/types";
import type { AppDispatch } from "../store";

type ProfileDialogProps = {
  user: AuthUser;
  onUserUpdated: (user: AuthUser) => void;
  onReloginRequired: () => void;
  onClose: () => void;
};

export function ProfileDialog({
  user,
  onUserUpdated,
  onReloginRequired,
  onClose,
}: ProfileDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const members = useMembers();
  const membersStatus = useMembersStatus();
  const member = useMemo(
    () => members.find((item) => item.id === user.id),
    [members, user.id]
  );

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [photo, setPhoto] = useState(user.photo ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(member?.name ?? user.name);
    setEmail(member?.email ?? user.email);
    setPhoto(member?.photo ?? user.photo ?? "");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSaving(false);
  }, [member, user.email, user.name, user.photo]);

  const loadingMembers = membersStatus === "idle" || membersStatus === "loading";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || !member) return;

    const nextName = name.trim();
    const nextEmail = email.trim().toLowerCase();
    const nextPassword = password.trim();

    if (nextName.length < 3) {
      setError("Informe o nome completo com pelo menos 3 caracteres.");
      return;
    }

    if (!isValidEmail(nextEmail)) {
      setError("Informe um e-mail válido.");
      return;
    }

    if (nextPassword && nextPassword.length < 6) {
      setError("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (nextPassword && nextPassword !== confirmPassword.trim()) {
      setError("A confirmação da senha não confere.");
      return;
    }

    const emailChanged = nextEmail !== member.email.trim().toLowerCase();
    const passwordChanged = nextPassword.length > 0;
    const requiresRelogin = emailChanged || passwordChanged;

    setSaving(true);
    setError("");

    try {
      const updated = await updateMembers(member.id, new AbortController().signal, {
        name: nextName,
        email: nextEmail,
        phone: member.phone ?? "",
        photo,
        birthDate: member.birthDate ?? "",
        role: member.role,
        status: member.status,
        password: passwordChanged ? nextPassword : undefined,
      });

      dispatch(membersUpdate(updated));

      if (requiresRelogin) {
        onReloginRequired();
        return;
      }

      onUserUpdated({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        photo: updated.photo,
      });
      onClose();
    } catch (caught: unknown) {
      if (caught instanceof DOMException && caught.name === "AbortError") {
        return;
      }

      setError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível atualizar o perfil."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-labelledby="profile-dialog-title"
      className="fixed inset-x-4 top-16 z-50 mt-2 flex max-h-[min(28rem,calc(100dvh-5.5rem))] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_16px_40px_rgba(24,24,27,0.12)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:w-96"
    >
      <div className="shrink-0 border-b border-zinc-100 px-4 py-3">
        <div className="min-w-0">
          <p
            id="profile-dialog-title"
            className="text-xs font-medium uppercase tracking-[0.24em] text-rotaract-pink"
          >
            Perfil
          </p>
          <p className="mt-1 truncate text-xs text-zinc-500">
            Atualize seus dados de acesso
          </p>
        </div>
      </div>

      {loadingMembers ? (
        <p className="px-4 py-8 text-center text-sm text-zinc-500">
          Carregando seu perfil...
        </p>
      ) : !member ? (
        <p className="px-4 py-8 text-center text-sm text-rose-500">
          Não foi possível carregar seus dados.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3">
            <MemberPhotoField
              name={name}
              photoUrl={photo}
              onChange={setPhoto}
              onError={setError}
            />

            <label className="block">
              <span className="mb-1.5 block text-sm text-zinc-600">Nome</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={MEMBER_INPUT_CLASS}
                placeholder="Seu nome completo"
                autoComplete="name"
                maxLength={80}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm text-zinc-600">E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={MEMBER_INPUT_CLASS}
                placeholder="nome@clube.org"
                autoComplete="email"
              />
              <span className="mt-1.5 block text-xs text-zinc-400">
                Alterar o e-mail encerra a sessão e pede um novo login.
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm text-zinc-600">Nova senha</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={MEMBER_INPUT_CLASS}
                placeholder="Deixe em branco para manter"
                autoComplete="new-password"
              />
              <span className="mt-1.5 block text-xs text-zinc-400">
                Alterar a senha também encerra a sessão atual.
              </span>
            </label>

            {password ? (
              <label className="block">
                <span className="mb-1.5 block text-sm text-zinc-600">
                  Confirmar senha
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className={MEMBER_INPUT_CLASS}
                  placeholder="Repita a nova senha"
                  autoComplete="new-password"
                />
              </label>
            ) : null}

            {error ? (
              <p className="text-sm text-rose-500" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-zinc-100 p-3">
            <Button
              type="submit"
              loading={saving}
              title={saving ? "Salvando..." : "Salvar alterações"}
              className="h-10 w-full rounded-xl"
            />
          </div>
        </form>
      )}
    </div>
  );
}
