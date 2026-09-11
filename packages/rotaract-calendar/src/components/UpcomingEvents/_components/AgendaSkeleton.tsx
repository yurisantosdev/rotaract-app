export function AgendaSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2" aria-hidden>
      {Array.from({ length: 2 }, (_, column) => (
        <div key={column} className="space-y-3">
          <div className="h-4 w-24 animate-pulse rounded-full bg-zinc-100" />
          {Array.from({ length: 1 }, (_, row) => (
            <div
              key={row}
              className="h-[4.25rem] animate-pulse rounded-2xl bg-zinc-100"
            />
          ))}
        </div>
      ))}
    </div>
  );
}