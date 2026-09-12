"use client";

export function useMemberAvatar() {
  const sizeClass = {
    sm: "h-10 w-10 text-xs",
    md: "h-12 w-12 text-sm",
    xs: "h-7 w-7 text-[10px]",
  };

  return {
    sizeClass
  };
}
