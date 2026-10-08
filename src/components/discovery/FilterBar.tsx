"use client";

export type DiscoveryFilter =
  | "live"
  | "all"
  | "mature"
  | "milf"
  | "popular"
  | "new";

const FILTERS: { id: DiscoveryFilter; label: string }[] = [
  { id: "live", label: "Live now" },
  { id: "all", label: "All" },
  { id: "mature", label: "Mature" },
  { id: "milf", label: "MILF" },
  { id: "popular", label: "Popular" },
  { id: "new", label: "New" },
];

type FilterBarProps = {
  active: DiscoveryFilter;
  onChange: (filter: DiscoveryFilter) => void;
};

export function FilterBar({ active, onChange }: FilterBarProps) {
  return (
    <div
      className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Browse categories"
    >
      {FILTERS.map((filter) => {
        const isActive = active === filter.id;
        return (
          <button
            key={filter.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(filter.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition sm:px-4 sm:text-sm sm:normal-case sm:tracking-normal ${
              isActive
                ? "bg-rose-600 text-white shadow-md shadow-rose-900/40"
                : "border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:border-zinc-600 hover:text-zinc-100"
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
