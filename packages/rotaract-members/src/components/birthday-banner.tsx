import { CakeIcon, ConfettiIcon } from "@phosphor-icons/react";
import { MemberAvatar } from "./member-avatar";
import {
  currentMonthLabel,
  formatBirthDate,
  type Member,
} from "../types/member";

type BirthdayBannerProps = {
  members: Member[];
};

function firstName(name: string) {
  return name.trim().split(/\s+/).filter(Boolean)[0] || name;
}

function isBirthdayToday(value?: string) {
  if (!value) return false;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return date.getDate() === now.getDate() && date.getMonth() === now.getMonth();
}

function birthDay(value?: string) {
  if (!value) return 0;
  return Number(value.slice(8, 10)) || 0;
}

export function BirthdayBanner({ members }: BirthdayBannerProps) {
  if (members.length === 0) return null;

  const sorted = [...members].sort((a, b) => birthDay(a.birthDate) - birthDay(b.birthDate));
  const todayCount = sorted.filter((member) => isBirthdayToday(member.birthDate)).length;
  const month = currentMonthLabel();

  return (
    <div className="relative mt-5 overflow-hidden rounded-3xl border border-rotaract-pink/20 bg-gradient-to-r from-rotaract-pink/12 via-white to-violet-100/70 p-4 shadow-[0_16px_40px_rgba(255,45,122,0.10)] sm:p-5">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-rotaract-pink/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 left-20 h-28 w-28 rounded-full bg-violet-300/30 blur-3xl"
      />

      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rotaract-pink text-white shadow-[0_10px_24px_rgba(255,45,122,0.32)]">
            <CakeIcon className="h-6 w-6" weight="fill" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rotaract-pink">
              Celebração do clube
            </p>
            <p className="mt-1 text-base font-semibold tracking-tight text-zinc-900 sm:text-lg">
              Aniversariantes de {month}
            </p>
            <p className="mt-0.5 text-sm text-zinc-500">
              {todayCount > 0
                ? `${todayCount === 1 ? "1 companheiro faz" : `${todayCount} companheiros fazem`} aniversário hoje.`
                : `${sorted.length} ${sorted.length === 1 ? "companheiro" : "companheiros"} para parabenizar neste mês.`}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3 lg:items-end">
          <div className="flex items-center">
            {sorted.slice(0, 5).map((member, index) => (
              <span
                key={member.id}
                className="rounded-full ring-2 ring-white"
                style={{ marginLeft: index === 0 ? 0 : -10, zIndex: 10 - index }}
              >
                <MemberAvatar member={member} size="sm" />
              </span>
            ))}
            {sorted.length > 5 ? (
              <span className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-rotaract-pink text-[11px] font-semibold text-white ring-2 ring-white">
                +{sorted.length - 5}
              </span>
            ) : null}
          </div>

          <ul className="flex flex-wrap gap-2 lg:justify-end">
            {sorted.map((member) => {
              const today = isBirthdayToday(member.birthDate);
              const label = member.birthDate
                ? `${firstName(member.name)} · ${formatBirthDate(member.birthDate)}`
                : firstName(member.name);

              return (
                <li key={member.id}>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                      today
                        ? "bg-rotaract-pink text-white shadow-[0_8px_20px_rgba(255,45,122,0.28)]"
                        : "bg-white/80 text-zinc-800 ring-1 ring-rotaract-pink/15"
                    }`}
                  >
                    {today ? (
                      <ConfettiIcon className="h-3.5 w-3.5" weight="fill" aria-hidden />
                    ) : null}
                    {label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
