import { initialsFromName } from "../../types/member";
import { useMemberAvatar } from "./services";
import { MemberAvatarProps } from "./type";

export function MemberAvatar({
  member,
  size = "md",
  className
}: MemberAvatarProps) {
  const data = useMemberAvatar();
  if (!data) return null;
  const { sizeClass } = data;

  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-rotaract-pink/10 font-semibold text-rotaract-pink ${sizeClass[size]} ${className}`}
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
