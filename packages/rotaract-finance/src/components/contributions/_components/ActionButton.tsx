import { Tooltip } from "@rotaract/components";
import { ReactNode } from "react";

export function ActionButton({
  label,
  disabled,
  loading,
  hover,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  loading?: boolean;
  hover: string;
  onClick: () => void;
  children: ReactNode;
}) {
  const isLoading = Boolean(loading);
  function iconButtonClassName(
    hover: string,
    disabled: boolean,
    loading: boolean
  ): string {
    if (loading) {
      return "rounded-full p-1.5 text-sm text-zinc-500 transition cursor-wait";
    }

    return `rounded-full p-1.5 text-sm text-zinc-500 transition ${disabled
      ? "cursor-not-allowed opacity-40"
      : hover
      }`;
  }

  return (
    <Tooltip label={isLoading ? "Carregando..." : label}>
      <button
        type="button"
        aria-label={isLoading ? "Carregando" : label}
        aria-busy={isLoading || undefined}
        disabled={Boolean(disabled) || isLoading}
        onClick={onClick}
        className={iconButtonClassName(hover, Boolean(disabled), isLoading)}
      >
        {isLoading ? (
          <span
            className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-zinc-200 border-t-rotaract-pink motion-reduce:animate-none"
            aria-hidden
          />
        ) : (
          children
        )}
      </button>
    </Tooltip>
  );
}
