"use client";

import { FormEvent, MouseEvent, useMemo, useState } from "react";

type Status = "idle" | "loading" | "success";

function greetingForNow() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function LoginForm() {
  const greeting = useMemo(() => greetingForNow(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [spotlight, setSpotlight] = useState({ x: 180, y: 80 });

  function moveSpotlight(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setSpotlight({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }

  function resetForm() {
    setStatus("idle");
    setError("");
    setInfo("");
  }

  function handleForgotPassword() {
    setError("");
    setInfo("Recuperação de senha ainda não está conectada. Em breve por aqui.");
  }

  function handleCreateAccount() {
    setError("");
    setInfo("O cadastro de novos membros ainda não está disponível nesta tela.");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInfo("");

    const trimmedEmail = email.trim();
    const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

    if (!trimmedEmail || !password) {
      setError("Preencha e-mail e senha para continuar.");
      return;
    }

    if (!emailLooksValid) {
      setError("Digite um e-mail válido.");
      return;
    }

    setError("");
    setStatus("loading");

    await new Promise((resolve) => setTimeout(resolve, 1100));

    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-[0_24px_60px_rgba(24,24,27,0.08)] sm:p-10">
        <div className="login-check mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rotaract-pink/10 text-rotaract-pink ring-1 ring-rotaract-pink/20">
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden>
            <path
              d="M5 12.5 9.5 17 19 7.5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-900">Tudo certo</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          Login simulado com sucesso. A autenticação real ainda não está ligada ao
          sistema.
        </p>
        <button
          type="button"
          onClick={resetForm}
          className="mt-8 inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 px-5 text-sm font-medium text-zinc-800 transition hover:border-rotaract-pink/40 hover:bg-rotaract-pink/5"
        >
          Voltar ao formulário
        </button>
      </div>
    );
  }

  return (
    <div
      onMouseMove={moveSpotlight}
      className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_24px_60px_rgba(24,24,27,0.08)] sm:p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity"
        style={{
          background: `radial-gradient(420px circle at ${spotlight.x}px ${spotlight.y}px, rgba(255,45,122,0.08), transparent 42%)`,
        }}
      />

      <div className="relative">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-rotaract-pink">
          Área de membros
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">{greeting}</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          Entre para acompanhar projetos, reuniões e a vida do clube.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
          <label className="block">
            <span className="mb-2 block text-sm text-zinc-600">E-mail</span>
            <span className="relative block">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
                  <path
                    d="M4 7.5h16v9H4v-9Zm0 0 8 6 8-6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="voce@rotaract.org"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm text-zinc-900 outline-none ring-rotaract-pink/20 transition placeholder:text-zinc-400 focus:border-rotaract-pink/50 focus:bg-white focus:ring-4"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-zinc-600">Senha</span>
            <span className="relative block">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
                  <path
                    d="M7.5 10.5V8a4.5 4.5 0 1 1 9 0v2.5M6.5 10.5h11V19h-11v-8.5Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-10 pr-12 text-sm text-zinc-900 outline-none ring-rotaract-pink/20 transition placeholder:text-zinc-400 focus:border-rotaract-pink/50 focus:bg-white focus:ring-4"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-2 my-1 flex w-10 items-center justify-center rounded-xl text-zinc-400 transition hover:text-zinc-800"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                    <path
                      d="M3 3l18 18M10.5 10.7A3 3 0 0 0 13.3 13.5M9.9 5.6A10.8 10.8 0 0 1 12 5.5c5.2 0 8.8 4.2 9.8 6.5-.4.8-1.5 2.6-3.4 4.1M6.6 6.6C4.5 8.1 3.3 10 2.2 12c1 2.3 4.6 6.5 9.8 6.5 1.3 0 2.5-.2 3.6-.6"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                    <path
                      d="M2.2 12C3.2 9.7 6.8 5.5 12 5.5S20.8 9.7 21.8 12C20.8 14.3 17.2 18.5 12 18.5S3.2 14.3 2.2 12Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
                  </svg>
                )}
              </button>
            </span>
          </label>

          <div className="flex items-center justify-between gap-3 text-sm">
            <label className="inline-flex items-center gap-2 text-zinc-500 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 bg-white accent-rotaract-pink"
              />
              Lembrar de mim
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-rotaract-pink transition hover:text-rotaract-pink-soft"
            >
              Esqueci a senha
            </button>
          </div>

          <div aria-live="polite" className="min-h-6 text-sm">
            {error ? <p className="text-rose-400">{error}</p> : null}
            {info ? <p className="text-zinc-500">{info}</p> : null}
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            aria-busy={status === "loading"}
            className="login-shine relative isolate flex h-12 w-full items-center justify-center overflow-hidden rounded-full bg-rotaract-pink text-sm font-semibold text-white shadow-[0_12px_40px_rgba(255,45,122,0.28)] transition hover:bg-rotaract-magenta disabled:cursor-wait disabled:opacity-80"
          >
            {status === "loading" ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Ainda não faz parte do clube?{" "}
          <button
            type="button"
            onClick={handleCreateAccount}
            className="font-medium text-zinc-900 underline-offset-4 transition hover:text-rotaract-pink hover:underline"
          >
            Solicitar acesso
          </button>
        </p>
      </div>
    </div>
  );
}
