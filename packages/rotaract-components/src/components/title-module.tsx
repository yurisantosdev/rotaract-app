import { TitleModuleProps } from "../types/titleModule";

export function TitleModule({
  module,
  title,
  description,
}: TitleModuleProps) {
  return (
    <div className="mt-6 flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {module ? (
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-rotaract-pink break-words">
            {module}
          </p>
        ) : null}
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 break-words sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 w-full text-sm leading-relaxed text-zinc-500 break-words">
            {description}
          </p>
        ) : null}
      </div>

    </div>
  );
}
