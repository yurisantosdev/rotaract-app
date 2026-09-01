"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AppHeader } from "../_components/app-header";
import { apiFetch } from "../lib/api";
import { clearSession, getToken } from "../lib/auth";
import type { AuthUser } from "../lib/types";
import { ClubBrandingProvider } from "./_components/club-branding";
import { MemberSessionProvider } from "./_components/member-session";
import { Loading } from "@rotaract/components";

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

  return (
    user ? (
      <div className="min-h-dvh bg-rotaract-mist text-rotaract-ink">
        <ClubBrandingProvider>
          <AppHeader user={user} onLogout={handleLogout} />
          <MemberSessionProvider user={user}>{children}</MemberSessionProvider>
        </ClubBrandingProvider>
      </div>
    ) : (
      <Loading />
    )
  );
}
