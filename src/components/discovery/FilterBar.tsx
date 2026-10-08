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
      className="scrollbar-none -mx-0.5 flex items-center gap-1.5 overflow-x-auto px-0.5 py-1 lg:gap-2 lg:py-2"
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
            className={`min-h-[34px] shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition duration-fast sm:min-h-[40px] sm:px-4 sm:py-2 sm:text-xs lg:text-sm ${
              isActive
                ? "bg-accent text-white shadow-sm"
                : "border border-border/80 bg-surface-elevated/80 text-text-secondary hover:bg-surface-hover hover:text-foreground"
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
