"use client";

import type { DiscoveryFilterId } from "@/lib/models/filterQuery";

export type DiscoveryFilter = DiscoveryFilterId;

const FILTER_EMOJI: Record<DiscoveryFilter, string> = {
  live: "🔴",
  all: "✦",
  mature: "●",
  milf: "◆",
  popular: "★",
  new: "🕐",
  cougar: "◇",
};

const MOBILE_FILTERS: { id: DiscoveryFilter; label: string }[] = [
  { id: "live", label: "Live now" },
  { id: "all", label: "All" },
  { id: "mature", label: "Mature" },
  { id: "milf", label: "MILF" },
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

function pillClass(isActive: boolean): string {
  if (isActive) {
    return "bg-accent text-white";
  }
  return "border border-white/[0.08] bg-surface-elevated text-white";
}

export function FilterBar({ active, onChange }: FilterBarProps) {
  return (
    <>
      <div className="relative lg:hidden">
        <div
          className="scrollbar-none flex items-center gap-2 overflow-x-auto py-2 pl-3 pr-8"
          role="tablist"
          aria-label="Browse categories"
        >
          {MOBILE_FILTERS.map((filter) => {
            const isActive = active === filter.id;
            const emoji = FILTER_EMOJI[filter.id];
            return (
              <button
                key={filter.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onChange(filter.id)}
                className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-semibold leading-none transition duration-fast ${pillClass(isActive)}`}
              >
                <span className="text-[11px]" aria-hidden>{emoji}</span>
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[var(--header-bg)] to-transparent"
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
          const emoji = FILTER_EMOJI[filter.id];
          return (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(filter.id)}
              className={`flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition duration-fast lg:text-sm ${pillClass(isActive)}`}
            >
              <span className="text-sm" aria-hidden>{emoji}</span>
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
