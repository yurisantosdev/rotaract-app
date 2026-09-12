import { type Member } from "../../../types/member";

export function StatusBadge({ status }: { status: Member["status"] }) {
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