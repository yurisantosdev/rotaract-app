"use client";

import Link from "next/link";
import { UserIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import type { AuthUser } from "../lib/types";
import { useClubBranding } from "../home/_components/club-branding";
import { Notice } from "@rotaract/notices";
import { ProfileDialog } from "./profile-dialog";

type AppHeaderProps = {
  user: AuthUser;
  onLogout: () => void;
  onUserUpdated: (user: AuthUser) => void;
  onReloginRequired: () => void;
};

export function AppHeader({
  user,
  onLogout,
  onUserUpdated,
  onReloginRequired,
}: AppHeaderProps) {
  const { branding } = useClubBranding();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setProfileOpen(false);
    }

    function onPointerDown(event: PointerEvent) {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [profileOpen]);

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:h-[4.5rem] sm:px-6">
        <Link href="/home" className="flex min-w-0 items-center gap-3">
          <img
            src={branding.logo}
            alt={branding.name}
            width={120}
            height={40}
            className="h-9 w-auto max-w-28 object-contain"
          />
          <span className="hidden truncate text-sm font-semibold text-zinc-800 sm:inline">
            {branding.name}
          </span>
        </Link>

        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <div className="flex h-10 w-10 items-center justify-center ">
            <span className="h-5 w-5">
              <Notice />
            </span>
          </div>

          <div className="flex h-10 w-10 items-center justify-center">
            <span className="h-5 w-5">
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  aria-label="Perfil"
                  title="Perfil"
                  aria-haspopup="dialog"
                  aria-expanded={profileOpen}
                  onClick={() => setProfileOpen((open) => !open)}
                  className="relative inline-flex cursor-pointer items-center justify-center"
                >
                  <span className="relative block h-6 w-6" aria-hidden>
                    <span
                      className={`absolute inset-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                        profileOpen
                          ? "pointer-events-none scale-50 rotate-90 opacity-0"
                          : "scale-100 rotate-0 opacity-100"
                      }`}
                    >
                      <UserIcon size={24} />
                    </span>
                    <span
                      className={`absolute inset-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                        profileOpen
                          ? "scale-100 rotate-0 opacity-100"
                          : "pointer-events-none scale-50 -rotate-90 opacity-0"
                      }`}
                    >
                      <XIcon size={24} />
                    </span>
                  </span>
                </button>

                {profileOpen ? (
                  <ProfileDialog
                    user={user}
                    onUserUpdated={onUserUpdated}
                    onReloginRequired={onReloginRequired}
                    onClose={() => setProfileOpen(false)}
                  />
                ) : null}
              </div>
            </span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex h-10 items-center justify-center rounded-full bg-rotaract-pink px-3 text-sm font-semibold text-white transition hover:bg-rotaract-magenta sm:px-4"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
