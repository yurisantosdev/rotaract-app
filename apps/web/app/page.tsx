import Image from "next/image";
import { LoginForm } from "./_components/login-form";

const highlights = [
  {
    title: "Servir",
    text: "Projetos que aproximam o clube da comunidade.",
  },
  {
    title: "Liderar",
    text: "Espaço para organizar reuniões, cargos e prazos.",
  },
  {
    title: "Conectar",
    text: "Acompanhe eventos, sócios e a energia do Rotary.",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-rotaract-mist text-rotaract-ink">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="login-grid absolute -inset-16 bg-[linear-gradient(rgba(24,24,27,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,27,0.05)_1px,transparent_1px)] bg-[size:64px_64px] opacity-70" />
        <div className="login-orb left-[-8rem] top-[-6rem] h-[28rem] w-[28rem] bg-rotaract-pink/25" />
        <div
          className="login-orb bottom-[-8rem] right-[-4rem] h-[26rem] w-[26rem] bg-violet-300/40"
          style={{ animationDelay: "-7s" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),rgba(247,245,247,0.92)_62%)]" />
      </div>

      <div className="relative mx-auto grid min-h-dvh w-full max-w-6xl items-start gap-10 px-5 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-8 lg:py-12">
        <section className="order-2 max-w-xl lg:order-1">
          <div className="flex justify-center lg:justify-start">
            <div className="inline-flex rounded-3xl bg-zinc-950 px-6 py-5 shadow-sm">
              <Image
                src="/logo.webp"
                alt="Antalya Olimpos Rotaract Kulübü"
                width={720}
                height={220}
                priority
                className="h-28 w-auto mix-blend-screen sm:h-36 lg:h-40"
              />
            </div>
          </div>

          <p className="mt-8 text-sm uppercase tracking-[0.32em] text-zinc-400">
            Antalya Olimpos
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
            O clube em um só lugar.
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-500">
            Uma entrada moderna para membros, diretoria e convidados. Nesta
            versão, o login só simula o fluxo — sem autenticar de verdade.
          </p>

          <ul className="mt-10 grid gap-3 sm:grid-cols-3">
            {highlights.map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm"
              >
                <p className="text-sm font-semibold text-rotaract-pink">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">{item.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="order-1 w-full max-w-md justify-self-end lg:order-2 lg:max-w-none">
          <LoginForm />
          <p className="mt-6 text-center text-xs text-zinc-400">
            © {new Date().getFullYear()} Antalya Olimpos Rotaract Kulübü
          </p>
        </section>
      </div>
    </main>
  );
}
