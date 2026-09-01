import React from "react";
import { ButtonInterface } from "../types/button";

export function Button({
  title,
  icon,
  loading = false,
  disabled,
  className,
  type = "button",
  ...props
}: ButtonInterface) {
  const isIconOnly = !title;
  const baseClassName = isIconOnly
    ? "inline-flex items-center justify-center rounded-full bg-rotaract-pink p-3.5 text-white transition hover:bg-rotaract-magenta cursor-pointer disabled:cursor-wait disabled:opacity-80 disabled:hover:bg-rotaract-pink"
    : "inline-flex h-11 items-center justify-center rounded-full bg-rotaract-pink px-4 text-sm font-semibold text-white transition hover:bg-rotaract-magenta gap-1.5 cursor-pointer disabled:cursor-wait disabled:opacity-80 disabled:hover:bg-rotaract-pink";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${baseClassName} ${className ?? ""}`}
      {...props}
    >
      {loading ? (
        <span
          className={`${isIconOnly ? "h-5 w-5" : "h-4 w-4"} shrink-0 animate-spin rounded-full border-2 border-white/35 border-t-white motion-reduce:animate-none`}
          aria-hidden
        />
      ) : null}
      {title}
      {loading ? null : icon}
    </button>
  );
}
