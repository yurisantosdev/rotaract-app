import { useAnimatedNumber } from "@rotaract/components";

export function PautaProgressBar({
  completed,
  total,
  percent,
  className = "mt-4",
}: {
  completed: number;
  total: number;
  percent: number;
  className?: string;
}) {
  const displayed = useAnimatedNumber(percent);

  return (
    <div className={className}>
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>
          {completed}/{total}{" "}
          {total === 1 ? "item resolvido" : "itens resolvidos"}
        </span>
        <span className="tabular-nums">{Math.round(displayed)}%</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-200">
        <div
          className="h-full rounded-full bg-rotaract-pink"
          style={{ width: `${displayed}%` }}
        />
      </div>
    </div>
  );
}
