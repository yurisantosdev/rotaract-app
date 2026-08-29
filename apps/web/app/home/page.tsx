"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppHeader } from "../_components/app-header";
import { apiFetch } from "../lib/api";
import { clearSession, getToken } from "../lib/auth";
import type { AuthUser } from "../lib/types";

const modules = [
  {
    title: "Financeiro",
    description: "Tesouraria, contribuições e prestações de contas.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
        <path
          d="M4.5 7.5h15v10h-15v-10Zm0 0 7.5 5 7.5-5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Reuniões",
    description: "Pautas, atas e presença das reuniões do clube.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
        <path
          d="M7 8h10M7 12h6M6 5h12a2 2 0 0 1 2 2v12l-3.5-2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Agenda",
    description: "Eventos, projetos e compromissos do calendário.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
        <path
          d="M7 4v3M17 4v3M4.5 8h15M6 6.5h12A1.5 1.5 0 0 1 19.5 8v10A1.5 1.5 0 0 1 18 19.5H6A1.5 1.5 0 0 1 4.5 18V8A1.5 1.5 0 0 1 6 6.5Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Membros",
    description: "Cadastro, cargos e a família do Rotaract.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
        <path
          d="M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3.5 18.5c.8-2.8 3-4.5 5.5-4.5s4.7 1.7 5.5 4.5M15 14c2.2 0 4 1.4 4.7 3.5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Configurações",
    description: "Preferências do clube, permissões e ajustes da conta.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
        <path
          d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="M19.2 13.1a7.6 7.6 0 0 0 0-2.2l1.7-1.3-1.6-2.8-2 .8a7.7 7.7 0 0 0-1.9-1.1L15 4.4h-6l-.4 2.1a7.7 7.7 0 0 0-1.9 1.1l-2-.8-1.6 2.8 1.7 1.3a7.6 7.6 0 0 0 0 2.2L2.5 14.4l1.6 2.8 2-.8a7.7 7.7 0 0 0 1.9 1.1l.4 2.1h6l.4-2.1a7.7 7.7 0 0 0 1.9-1.1l2 .8 1.6-2.8-1.7-1.3Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
] as const;

function openModule(title: string) {
  window.alert(`${title} está em desenvolvimento.`);
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      clearSession();
      router.replace("/");
      return;
    }

    let cancelled = false;

    apiFetch<AuthUser>("/api/auth/me", { token })
      .then(({ ok, data }) => {
        if (cancelled) return;
        if (!ok || !data.name) {
          clearSession();
          router.replace("/");
          return;
        }
        setUser(data);
      })
      .catch(() => {
        if (cancelled) return;
        clearSession();
        router.replace("/");
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  function handleLogout() {
    clearSession();
    router.replace("/");
    router.refresh();
  }

  if (!user) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-rotaract-mist text-zinc-500">
        Carregando...
      </main>
    );
  }

  return (
    <div className="min-h-dvh bg-rotaract-mist text-rotaract-ink">
      <AppHeader onLogout={handleLogout} />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-rotaract-pink">
          Área de membros
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Olá, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
          Escolha um módulo para continuar. Por enquanto, cada área ainda está
          em desenvolvimento.
        </p>

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          {modules.map((module) => (
            <button
              key={module.title}
              type="button"
              onClick={() => openModule(module.title)}
              className="group flex items-start gap-4 rounded-3xl border border-zinc-200 bg-white p-5 text-left shadow-[0_12px_40px_rgba(24,24,27,0.04)] transition hover:-translate-y-0.5 hover:border-rotaract-pink/30 hover:shadow-[0_16px_40px_rgba(255,45,122,0.08)]"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rotaract-pink/10 text-rotaract-pink transition group-hover:bg-rotaract-pink group-hover:text-white">
                {module.icon}
              </span>
              <span>
                <span className="block text-base font-semibold text-zinc-900">
                  {module.title}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-zinc-500">
                  {module.description}
                </span>
              </span>
            </button>
          ))}
        </section>
      </main>
    </div>
  );
}
