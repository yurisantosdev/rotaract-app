"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { AuthUser } from "../lib/types";

type AppHeaderProps = {
  user: AuthUser;
  onLogout: () => void;
};

export function AppHeader({ user, onLogout }: AppHeaderProps) {
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
          <Image
            src="/logo.jpg"
            alt="Rotaract Club Chapecó"
            width={120}
            height={40}
            className="h-9 w-auto"
          />
          <span className="hidden truncate text-sm font-semibold text-zinc-800 sm:inline">
            Rotaract Club Chapecó
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              aria-label="Perfil"
              title="Perfil"
              aria-haspopup="dialog"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-800 transition hover:border-rotaract-pink/40 hover:bg-rotaract-pink/5 hover:text-rotaract-pink"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.7" />
                <path
                  d="M5.5 18.2c.9-2.6 3.3-4.2 6.5-4.2s5.6 1.6 6.5 4.2"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {profileOpen ? (
              <div
                role="dialog"
                aria-labelledby="profile-dialog-title"
                className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_16px_40px_rgba(24,24,27,0.12)]"
              >
                <p
                  id="profile-dialog-title"
                  className="text-xs font-medium uppercase tracking-[0.24em] text-rotaract-pink"
                >
                  Perfil
                </p>
                <dl className="mt-3 space-y-3">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                      Nome
                    </dt>
                    <dd className="mt-0.5 text-sm font-medium text-zinc-900">{user.name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                      E-mail
                    </dt>
                    <dd className="mt-0.5 break-all text-sm font-medium text-zinc-900">
                      {user.email}
                    </dd>
                  </div>
                </dl>
              </div>
            ) : null}
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
