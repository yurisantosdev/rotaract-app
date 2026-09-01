"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useMemberSession } from "./_components/member-session";

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

const modules = [
  {
    title: "Financeiro",
    description: "Tesouraria, mensalidades e prestações de contas.",
    href: "/home/finance",
    action: "Abrir tesouraria",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
        <path
          d="M4 9.5h16V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18V9.5Zm1.2-1.5 1.4-2.6A1.5 1.5 0 0 1 7.9 4.5h8.2a1.5 1.5 0 0 1 1.3.9L18.8 8M15.5 14h3"
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
    href: "/home/meeting",
    action: "Abrir reuniões",
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
    href: "/home/calendar",
    action: "Abrir agenda",
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
    href: "/home/members",
    action: "Abrir membros",
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
    href: "/home/settings",
    action: "Abrir configurações",
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

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 transition group-hover:translate-x-0.5"
      fill="none"
      aria-hidden
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ModuleCard({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action: string;
}) {
  return (
    <>
      <span className="flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rotaract-pink/10 text-rotaract-pink transition group-hover:bg-rotaract-pink group-hover:text-white group-hover:shadow-[0_10px_28px_rgba(255,45,122,0.28)]">
          {icon}
        </span>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
          Disponível
        </span>
      </span>
      <span className="mt-5 block">
        <span className="block text-lg font-semibold tracking-tight text-zinc-900">
          {title}
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-zinc-500">
          {description}
        </span>
      </span>
      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-rotaract-pink">
        {action}
        <ArrowIcon />
      </span>
    </>
  );
}

export default function HomePage() {
  const { user } = useMemberSession();
  const [now, setNow] = useState<Date | null>(null);
  const firstName = user.name.split(" ")[0] || user.name;

  useEffect(() => {
    setNow(new Date());
  }, []);

  return (
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

          <div className="flex shrink-0 flex-wrap items-center gap-2 justify-center">
            <p className="rounded-full border border-zinc-200/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-zinc-600 backdrop-blur">
              {now ? formatToday(now) : "Rotaract Club Chapecó"}
            </p>
            <p className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              {modules.length} módulos disponíveis
            </p>
          </div>
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
                  <ModuleCard
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
  );
}
