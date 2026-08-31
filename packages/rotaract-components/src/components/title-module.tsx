import { TitleModuleProps } from "../types/titleModule";

export function TitleModule({
  module,
  title,
  description,
}: TitleModuleProps) {
  return (
    <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {module ? (
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-rotaract-pink">
            {module}
          </p>
        ) : null}
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 w-full text-sm leading-relaxed text-zinc-500">
            {description}
          </p>
        ) : null}
      </div>

    </div>
  );
}
