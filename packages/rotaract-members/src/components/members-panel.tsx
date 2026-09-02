"use client";

import { useMemo, useState } from "react";
import {
  ArrowCounterClockwiseIcon,
  PencilSimpleIcon,
  PlusIcon,
  UserMinusIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { Button, ConfirmModal, Tooltip } from "@rotaract/components";
import { BirthdayBanner } from "./birthday-banner";
import { MemberAvatar } from "./member-avatar";
import { MemberModal } from "./member-modal";
import {
  formatBirthDate,
  isBirthdayThisMonth,
  isBoardRole,
  MEMBER_FILTERS,
  MEMBER_INPUT_CLASS,
  normalizeSearch,
  type Member,
  type MemberFilter,
  type MemberPayload,
} from "../types/member";

type MembersPanelProps = {
  members: Member[];
  onCreate: (payload: MemberPayload) => void | Promise<void>;
  onUpdate: (id: string, payload: MemberPayload) => void | Promise<void>;
  onChangeStatus: (member: Member) => void;
};

function StatusBadge({ status }: { status: Member["status"] }) {
  const active = status === "ativo";
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${active ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"
        }`}
    >
      {active ? "Ativo" : "Inativo"}
    </span>
  );
}

export function MembersPanel({
  members,
  onCreate,
  onUpdate,
  onChangeStatus,
}: MembersPanelProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MemberFilter>("todos");
  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberToToggle, setMemberToToggle] = useState<Member | null>(null);

  const filtered = useMemo(() => {
    const term = normalizeSearch(query);

    return members
      .filter((member) => {
        const matchesFilter =
          filter === "todos" ||
          (filter === "diretoria" ? isBoardRole(member.role) : member.status === filter);
        if (!matchesFilter) return false;
        if (!term) return true;

        return (
          normalizeSearch(member.name).includes(term) ||
          normalizeSearch(member.email).includes(term) ||
          normalizeSearch(member.phone ?? "").includes(term) ||
          normalizeSearch(member.role).includes(term)
        );
      })
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === "ativo" ? -1 : 1;
        return a.name.localeCompare(b.name, "pt-BR");
      });
  }, [filter, members, query]);

  const birthdaysThisMonth = useMemo(
    () =>
      members.filter(
        (member) =>
          member.status === "ativo" && isBirthdayThisMonth(member.birthDate)
      ),
    [members]
  );

  function openCreate() {
    setEditingMember(null);
    setFormOpen(true);
  }

  function openEdit(member: Member) {
    setEditingMember(member);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingMember(null);
  }

  function handleSave(payload: MemberPayload) {
    if (editingMember) {
      return onUpdate(editingMember.id, payload);
    }
    return onCreate(payload);
  }

  return (
    <section className="mt-8 rounded-3xl border border-zinc-200 bg-white p-4 shadow-[0_12px_40px_rgba(24,24,27,0.04)] sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Companheiros</h2>
          <p className="mt-1 hidden text-sm text-zinc-500 md:flex">
            Busque, cadastre e atualize a família do clube.
          </p>
        </div>
        <Tooltip label="Novo membro">
          <Button
            aria-label="Novo membro"
            icon={<PlusIcon className="h-5 w-5" />}
            onClick={openCreate}
          />
        </Tooltip>
      </div>

      <BirthdayBanner members={birthdaysThisMonth} />

      <div className="mt-5 md:flex justify-between gap-3 lg:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className={MEMBER_INPUT_CLASS}
          placeholder="Buscar por nome, e-mail, telefone ou cargo"
        />
        <div className="md:w-[40%] w-full md:mt-0 mt-4 flex justify-between overflow-x-auto rounded-full border border-zinc-200 bg-zinc-50 p-1">
          {MEMBER_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`h-9 shrink-0 rounded-full px-3 text-sm font-medium transition ${filter === item.id
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-zinc-400">
        {filtered.length} {filtered.length === 1 ? "membro" : "membros"}
      </p>

      <ul className="mt-2 max-h-[560px] divide-y divide-zinc-100 overflow-y-auto">
        {filtered.length === 0 ? (
          <li className="flex flex-col items-center px-4 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rotaract-pink/10 text-rotaract-pink">
              <UsersThreeIcon className="h-6 w-6" weight="bold" aria-hidden />
            </span>
            <p className="mt-4 text-sm font-medium text-zinc-800">
              {members.length === 0
                ? "Nenhum membro cadastrado ainda."
                : "Nenhum membro encontrado com esses filtros."}
            </p>
            <p className="mt-1 max-w-sm text-sm text-zinc-500">
              {members.length === 0
                ? "Comece cadastrando a diretoria e os sócios do clube."
                : "Tente outro nome ou limpe o filtro para ver a lista completa."}
            </p>
            {members.length === 0 ? (
              <button
                type="button"
                onClick={openCreate}
                className="mt-5 text-sm font-semibold text-rotaract-pink transition hover:text-rotaract-magenta"
              >
                Cadastrar primeiro membro
              </button>
            ) : null}
          </li>
        ) : (
          filtered.map((member) => (
            <li key={member.id} className="py-4 mt-4">
              <div className="flex items-start gap-3 sm:items-center">
                <MemberAvatar member={member} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-zinc-900">{member.name}</p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${isBoardRole(member.role)
                        ? "bg-rotaract-pink/10 text-rotaract-pink"
                        : "bg-zinc-100 text-zinc-600"
                        }`}
                    >
                      {member.role}
                    </span>
                    {isBirthdayThisMonth(member.birthDate) ? (
                      <span className="rounded-full bg-rotaract-pink/10 px-2.5 py-0.5 text-[11px] font-semibold text-rotaract-pink">
                        Aniversário
                      </span>
                    ) : null}
                    <span className="sm:hidden">
                      <StatusBadge status={member.status} />
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1 sm:gap-2 mr-6">
                  <span className="hidden sm:inline">
                    <StatusBadge status={member.status} />
                  </span>
                  <Tooltip label="Editar">
                    <button
                      type="button"
                      aria-label={`Editar ${member.name}`}
                      onClick={() => openEdit(member)}
                      className="rounded-full p-1.5 text-sm text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
                    >
                      <PencilSimpleIcon className="h-4 w-4 text-zinc-500" />
                    </button>
                  </Tooltip>
                  <Tooltip
                    label={member.status === "ativo" ? "Inativar" : "Reativar"}
                  >
                    <button
                      type="button"
                      aria-label={
                        member.status === "ativo"
                          ? `Inativar ${member.name}`
                          : `Reativar ${member.name}`
                      }
                      onClick={() => setMemberToToggle(member)}
                      className={`rounded-full p-1.5 text-sm text-zinc-500 transition ${member.status === "ativo"
                        ? "hover:bg-rose-50 hover:text-zinc-800"
                        : "hover:bg-emerald-50 hover:text-zinc-800"
                        }`}
                    >
                      {member.status === "ativo" ? (
                        <UserMinusIcon className="h-4 w-4 text-red-500" />
                      ) : (
                        <ArrowCounterClockwiseIcon className="h-4 w-4 text-emerald-600" />
                      )}
                    </button>
                  </Tooltip>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>

      <MemberModal
        open={formOpen}
        member={editingMember}
        onClose={closeForm}
        onSave={handleSave}
      />

      <ConfirmModal
        open={Boolean(memberToToggle)}
        title={
          memberToToggle?.status === "inativo"
            ? "Reativar membro?"
            : "Inativar membro?"
        }
        description={
          memberToToggle
            ? memberToToggle.status === "inativo"
              ? `“${memberToToggle.name}” voltará a constar como ativo no clube.`
              : `“${memberToToggle.name}” passará a constar como inativo no clube.`
            : undefined
        }
        confirmLabel={
          memberToToggle?.status === "inativo" ? "Reativar" : "Inativar"
        }
        onClose={() => setMemberToToggle(null)}
        onConfirm={() => {
          if (!memberToToggle) return;
          onChangeStatus(memberToToggle);
          setMemberToToggle(null);
        }}
      />
    </section>
  );
}
