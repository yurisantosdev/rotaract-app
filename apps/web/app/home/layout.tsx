"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useDispatch } from "react-redux";
import { loadMembers, membersClean } from "@rotaract/members";
import { AppHeader } from "../_components/app-header";
import { apiFetch } from "../lib/api";
import { clearSession, getToken } from "../lib/auth";
import type { AuthUser } from "../lib/types";
import type { AppDispatch } from "../store";
import { ClubBrandingProvider } from "./_components/club-branding";
import { MemberSessionProvider } from "./_components/member-session";
import { Loading } from "@rotaract/components";

export default function HomeLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      clearSession();
      router.replace("/");
      return;
    }

    let cancelled = false;

    void Promise.all([
      apiFetch<AuthUser>("/api/auth/me", { token }),
      dispatch(loadMembers()),
    ])
      .then(([{ ok, data }]) => {
        if (cancelled) return;
        if (!ok || !data.name) {
          dispatch(membersClean());
          clearSession();
          router.replace("/");
          return;
        }
        setUser(data);
      })
      .catch(() => {
        if (cancelled) return;
        dispatch(membersClean());
        clearSession();
        router.replace("/");
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch, router]);

  function handleLogout() {
    dispatch(membersClean());
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
