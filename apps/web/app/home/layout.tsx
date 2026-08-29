"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AppHeader } from "../_components/app-header";
import { apiFetch } from "../lib/api";
import { clearSession, getToken } from "../lib/auth";
import type { AuthUser } from "../lib/types";
import { MemberSessionProvider } from "./_components/member-session";

export default function HomeLayout({
  children,
}: {
  children: ReactNode;
}) {
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
      <AppHeader user={user} onLogout={handleLogout} />
      <MemberSessionProvider user={user}>{children}</MemberSessionProvider>
    </div>
  );
}
