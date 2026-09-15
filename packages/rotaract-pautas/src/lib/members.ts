import type { Member } from "@rotaract/members";

export function findMember(
  members: Member[],
  id: string
): Member | undefined {
  return members.find((member) => member.id === id);
}

export function membersByIds(members: Member[], ids: string[]): Member[] {
  const seen = new Set<string>();
  const result: Member[] = [];

  for (const id of ids) {
    if (!id || seen.has(id)) continue;
    const member = findMember(members, id);
    if (!member) continue;
    seen.add(id);
    result.push(member);
  }

  return result;
}

export function memberDisplayName(member?: Member): string {
  return member?.name ?? "Companheiro";
}

export function firstName(name: string): string {
  return name.split(" ")[0] || name;
}

export function selectableMembers(
  members: Member[],
  selectedIds: string[]
): Member[] {
  return members
    .filter(
      (member) => member.status === "ativo" || selectedIds.includes(member.id)
    )
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}
