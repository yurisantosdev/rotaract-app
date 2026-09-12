import { useAnimatedNumber } from "@rotaract/components";

export function TaskStatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  const displayed = useAnimatedNumber(value);

  return (
    <article className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {title}
      </p>
      <p className="mt-2 text-xl font-semibold tabular-nums text-zinc-900">
        {Math.round(displayed)}
      </p>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
    </article>
  );
}