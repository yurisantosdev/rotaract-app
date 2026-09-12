import { useAnimatedNumber } from "@rotaract/components";

export function StatCard({
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
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 sm:rounded-3xl sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {title}
      </p>
      <p className="mt-2 text-xl font-semibold tabular-nums text-zinc-900 sm:text-2xl">
        {Math.round(displayed)}
      </p>
      <p className="mt-2 text-sm text-zinc-500">{description}</p>
    </article>
  );
}