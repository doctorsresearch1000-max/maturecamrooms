"use client";

export type DiscoveryFilter =
  | "live"
  | "all"
  | "mature"
  | "milf"
  | "cougar"
  | "popular"
  | "new";

const FILTERS: { id: DiscoveryFilter; label: string }[] = [
  { id: "live", label: "Live now" },
  { id: "all", label: "All" },
  { id: "mature", label: "Mature" },
  { id: "milf", label: "MILF" },
  { id: "cougar", label: "Cougar" },
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
      className="scrollbar-none -mx-1 flex items-center gap-2 overflow-x-auto px-1 py-2"
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
            className={`min-h-[44px] shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition duration-fast sm:text-sm ${
              isActive
                ? "bg-accent text-white"
                : "border border-border bg-surface text-text-secondary hover:bg-surface-hover hover:text-foreground"
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
