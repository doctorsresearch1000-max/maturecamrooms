export function ModelCardSkeleton() {
  return (
    <div
      className="aspect-[3/4] animate-pulse rounded-[var(--radius-card)] bg-surface-elevated"
      aria-hidden
    />
  );
}

export function ModelGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul
      className="grid grid-cols-2 gap-1.5 sm:gap-2 md:grid-cols-3 lg:grid-cols-4"
      aria-busy="true"
      aria-label="Loading models"
    >
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <ModelCardSkeleton />
        </li>
      ))}
    </ul>
  );
}
