import type { Member } from "@rotaract/members";

export function findMember(
  members: Member[],
  id: string
): Member | undefined {
  return members.find((member) => member.id === id);
}

export function membersByIds(members: Member[], ids: string[]): Member[] {
  return ids
    .map((id) => findMember(members, id))
    .filter((member): member is Member => Boolean(member));
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
