"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CardAccept, UpcomingEvents } from "@rotaract/calendar";
import { useMemberSession } from "./_components/member-session";
import { ContributionsOverdue } from "@rotaract/finance";
import { CardModule } from "./_components/cardModule";
import { modules } from "../types/hometype";
import { Main } from "./_components/main";

function greetingForHour(hour: number) {
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function formatToday(date: Date) {
  const formatted = date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (!first) return "RC";
  if (!last || parts.length === 1) return first.slice(0, 2).toUpperCase();
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

export default function HomePage() {
  const { user } = useMemberSession();
  const [now, setNow] = useState<Date | null>(null);
  const firstName = user.name.split(" ")[0] || user.name;

  useEffect(() => {
    setNow(new Date());
  }, []);

  return (
    <Main>
      <main className="relative min-h-[calc(100dvh-4.5rem)] overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="login-orb left-[-10rem] top-[-8rem] h-[22rem] w-[22rem] bg-rotaract-pink/15" />
          <div
            className="login-orb right-[-8rem] top-[12rem] h-[20rem] w-[20rem] bg-violet-300/30"
            style={{ animationDelay: "-7s" }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <section className="home-rise flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <span
                aria-hidden
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rotaract-pink text-lg font-semibold text-white shadow-[0_12px_32px_rgba(255,45,122,0.28)]"
              >
                {initialsFromName(user.name)}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-rotaract-pink">
                  Área de membros
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                  {now ? greetingForHour(now.getHours()) : "Olá"}, {firstName}
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-500">
                  Escolha um módulo para continuar o trabalho do clube.
                </p>
              </div>
            </div>

            <div>
              <div className="flex md:justify-end justify-center items-center gap-2">
                <ContributionsOverdue />
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2 justify-center mt-4">
                <p className="rounded-full border border-zinc-200/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-zinc-600 backdrop-blur">
                  {now ? formatToday(now) : "Rotaract Club Chapecó"}
                </p>
                <p className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                  {modules.length} módulos disponíveis
                </p>
              </div>
            </div>
          </section>

          <section className="home-rise mt-8 sm:mt-10" style={{ animationDelay: "90ms" }}>
            <CardAccept currentUserId={user.id} />
          </section>

          <section className="home-rise mt-8 sm:mt-10" style={{ animationDelay: "90ms" }}>
            <UpcomingEvents />
          </section>

          <section className="mt-8 sm:mt-10" aria-labelledby="modules-title">
            <h2 id="modules-title" className="sr-only">
              Módulos do clube
            </h2>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {modules.map((module, index) => (
                <li
                  key={module.title}
                  className="home-rise"
                  style={{ animationDelay: `${80 + index * 50}ms` }}
                >
                  <Link
                    href={module.href}
                    className="group flex h-full flex-col rounded-[1.5rem] border border-zinc-200/80 bg-white p-5 shadow-[0_12px_40px_rgba(24,24,27,0.04)] transition hover:-translate-y-0.5 hover:border-rotaract-pink/30 hover:shadow-[0_20px_48px_rgba(255,45,122,0.10)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rotaract-pink/20 sm:p-6"
                  >
                    <CardModule
                      icon={module.icon}
                      title={module.title}
                      description={module.description}
                      action={module.action}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </Main>
  );
}
