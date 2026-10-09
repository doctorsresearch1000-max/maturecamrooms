"use client";

export type DiscoveryFilter =
  | "live"
  | "all"
  | "mature"
  | "milf"
  | "cougar"
  | "popular"
  | "new";

const MOBILE_FILTERS: { id: DiscoveryFilter; label: string }[] = [
  { id: "live", label: "Live now" },
  { id: "all", label: "All" },
  { id: "mature", label: "Mature" },
  { id: "milf", label: "MILF" },
  { id: "cougar", label: "Cougar" },
  { id: "popular", label: "Popular" },
];

const DESKTOP_FILTERS: { id: DiscoveryFilter; label: string }[] = [
  ...MOBILE_FILTERS,
  { id: "new", label: "New" },
];

type FilterBarProps = {
  active: DiscoveryFilter;
  onChange: (filter: DiscoveryFilter) => void;
};

export function FilterBar({ active, onChange }: FilterBarProps) {
  return (
    <>
      <div
        className="scrollbar-none flex items-center gap-2 overflow-x-auto px-3 py-1.5 lg:hidden"
        role="tablist"
        aria-label="Browse categories"
      >
        {MOBILE_FILTERS.map((filter) => {
          const isActive = active === filter.id;
          const isLive = filter.id === "live";
          return (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(filter.id)}
              className={`shrink-0 rounded-full px-3 py-1 text-[13px] font-semibold leading-none transition duration-fast ${
                isActive && isLive
                  ? "bg-accent text-white shadow-[0_2px_12px_rgba(255,107,107,0.35)]"
                  : isActive
                    ? "bg-white/12 text-white"
                    : "bg-white/[0.04] text-text-secondary hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
      <div
        className="scrollbar-none hidden items-center gap-1.5 overflow-x-auto py-2 lg:flex"
        role="tablist"
        aria-label="Browse categories"
      >
        {DESKTOP_FILTERS.map((filter) => {
          const isActive = active === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(filter.id)}
              className={`min-h-[40px] shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition duration-fast lg:text-sm ${
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
    </>
  );
}
