"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { clearSession, getToken } from "../lib/auth";

export default function HomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      clearSession();
      router.replace("/");
      return;
    }

    let cancelled = false;

    apiFetch("/api/auth/me", { token })
      .then(({ ok }) => {
        if (cancelled) return;
        if (!ok) {
          clearSession();
          router.replace("/");
          return;
        }
        setReady(true);
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

  if (!ready) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-rotaract-mist text-zinc-500">
        Carregando...
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-rotaract-mist text-rotaract-ink">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">Home</h1>
      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex h-11 items-center justify-center rounded-full bg-rotaract-pink px-6 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(255,45,122,0.28)] transition hover:bg-rotaract-magenta"
      >
        Sair
      </button>
    </main>
  );
}
