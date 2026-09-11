export function OverflowLabel(hiddenCount: number) {
  if (hiddenCount <= 0) return null;

  return (
    <p className="px-1 text-[10px] text-zinc-400">+{hiddenCount} mais</p>
  );
}