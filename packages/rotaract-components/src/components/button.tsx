import React from "react";
import { ButtonInterface } from "../types/button";

export function Button({ title, icon, ...props }: ButtonInterface) {
  return (
    <button
      type="button"
      className={`inline-flex h-11 items-center justify-center rounded-full bg-rotaract-pink px-4 text-sm font-semibold text-white transition hover:bg-rotaract-magenta gap-1 cursor-pointer ${props.className ?? ''}`}
      {...props}
    >
      {title}
      {icon}
    </button>
  )
}