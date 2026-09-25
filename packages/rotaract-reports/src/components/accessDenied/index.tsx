import { ArrowCircleLeftIcon, LockSimpleIcon } from "@phosphor-icons/react";
import Link from "next/link";

export function AccessDenied() {
  return (
    <div>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-6rem] h-[18rem] w-[18rem] rounded-full bg-rotaract-pink/10 blur-3xl" />
        <div className="absolute bottom-[-4rem] right-[-6rem] h-[16rem] w-[16rem] rounded-full bg-violet-300/20 blur-3xl" />
      </div>

      <section
        className="relative flex flex-1 flex-col items-center justify-center py-16 text-center"
        aria-labelledby="access-denied-title"
      >
        <span
          aria-hidden
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rotaract-pink/10 text-rotaract-pink shadow-[0_12px_32px_rgba(255,45,122,0.12)]"
        >
          <LockSimpleIcon size={28} weight="duotone" />
        </span>

        <p className="mt-6 text-xs font-medium uppercase tracking-[0.28em] text-rotaract-pink">
          Acesso restrito
        </p>

        <h1
          id="access-denied-title"
          className="mt-3 max-w-lg text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl"
        >
          Você não tem permissão para este módulo
        </h1>

        <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-500">
          O módulo de Feedbacks é exclusivo para a equipe de desenvolvimento.
          Se precisar de acesso, fale com um administrador do clube.
        </p>

        <Link
          href='/home'
          className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-rotaract-pink px-5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(255,45,122,0.22)] transition hover:bg-rotaract-magenta"
        >
          <ArrowCircleLeftIcon
            size={24}
          />
        </Link>

      </section>
    </div>
  );
}