"use client";

import Link from "next/link";
import { useDrawerMenu } from "@/hooks/useDrawerMenu";

export function HeaderFacetChips() {
  const { headerChips, feedOk, loading } = useDrawerMenu(true);

  if (loading || !feedOk || headerChips.length === 0) {
    return null;
  }

  return (
    <div className="relative border-b border-white/[0.06] bg-[var(--header-bg)] lg:hidden">
      <div
        className="scrollbar-none flex items-center gap-2 overflow-x-auto px-3 py-2"
        aria-label="Browse by category"
      >
        {headerChips.map((chip) => (
          <Link
            key={`${chip.href}-${chip.slug}`}
            href={chip.href}
            className="flex max-w-[9.5rem] shrink-0 items-center gap-1 rounded-full border border-white/[0.08] bg-surface-elevated px-3 py-1.5 text-[11px] font-semibold text-white transition hover:border-accent/40"
          >
            {chip.icon ? (
              <span className="text-[10px] opacity-80" aria-hidden>
                {chip.icon}
              </span>
            ) : null}
            <span className="truncate">{chip.label}</span>
            {chip.count !== undefined && chip.count > 0 ? (
              <span className="text-[10px] tabular-nums text-text-muted">
                {chip.count}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[var(--header-bg)] to-transparent"
        aria-hidden
      />
    </div>
  );
}
