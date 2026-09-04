import { initialsFromName, type Member } from "../types/member";

type MemberAvatarProps = {
  member: Pick<Member, "name" | "photo">;
  size?: "sm" | "md" | "xs";
};

const sizeClass = {
  sm: "h-10 w-10 text-xs",
  md: "h-12 w-12 text-sm",
  xs: "h-7 w-7 text-[10px]",
};

export function MemberAvatar({ member, size = "md" }: MemberAvatarProps) {
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-rotaract-pink/10 font-semibold text-rotaract-pink ${sizeClass[size]}`}
    >
      {member.photo ? (
        <img
          src={member.photo}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        initialsFromName(member.name)
      )}
    </span>
  );
}
