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
      <div className="relative lg:hidden">
        <div
          className="scrollbar-none flex items-center gap-2 overflow-x-auto py-1.5 pl-3 pr-8"
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
                className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold leading-none transition duration-fast ${
                  isActive && isLive
                    ? "bg-accent text-white"
                    : isActive
                      ? "bg-white/10 text-white"
                      : "bg-white/[0.05] text-text-secondary"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-surface via-surface/80 to-transparent"
          aria-hidden
        />
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
