import type { TooltipProps } from "../types/tooltip";

export function Tooltip({ label, children }: TooltipProps) {
  return (
    <span className="group/tooltip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+0.4rem)] left-1/2 z-20 -translate-x-1/2 translate-y-1 scale-95 whitespace-nowrap rounded-lg bg-zinc-900 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white opacity-0 shadow-[0_8px_24px_rgba(24,24,27,0.28)] transition duration-150 ease-out group-hover/tooltip:translate-y-0 group-hover/tooltip:scale-100 group-hover/tooltip:opacity-100 group-focus-within/tooltip:translate-y-0 group-focus-within/tooltip:scale-100 group-focus-within/tooltip:opacity-100"
      >
        {label}
        <span
          aria-hidden
          className="absolute left-1/2 top-full h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-zinc-900"
        />
      </span>
    </span>
  );
}
