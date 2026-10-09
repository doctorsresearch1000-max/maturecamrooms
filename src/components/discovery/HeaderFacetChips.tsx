"use client";

import Link from "next/link";
import { useDrawerMenu } from "@/hooks/useDrawerMenu";

type HeaderFacetChipsProps = {
  /** Render in site header (full content width), not inside main column */
  fullWidth?: boolean;
};

export function HeaderFacetChips({ fullWidth = false }: HeaderFacetChipsProps) {
  const { headerChips, catalogOk, loading } = useDrawerMenu(true);

  if (loading || !catalogOk || headerChips.length === 0) {
    return null;
  }

  const filtered = headerChips.filter(
    (chip) =>
      !chip.slug ||
      (chip.slug !== "cougar" && chip.slug !== "mom"),
  );

  if (filtered.length === 0) return null;

  if (fullWidth) {
    return (
      <div className="relative border-t border-white/[0.06] bg-[var(--header-bg)]">
        <div
          className="scrollbar-none flex items-center gap-2 overflow-x-auto px-4 py-2 sm:px-6"
          aria-label="Browse by category"
        >
          {filtered.map((chip) => (
            <Link
              key={`${chip.href}-${chip.slug}`}
              href={chip.href}
              className="flex max-w-[11rem] shrink-0 items-center gap-1.5 rounded-full border border-white/[0.08] bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-white transition hover:border-accent/40"
            >
              {chip.icon ? (
                <span className="text-sm leading-none" aria-hidden>
                  {chip.icon}
                </span>
              ) : null}
              <span className="truncate">{chip.label}</span>
              {chip.count !== undefined && chip.count > 0 ? (
                <span className="text-[11px] tabular-nums text-text-muted">
                  {chip.count}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[var(--header-bg)] to-transparent"
          aria-hidden
        />
      </div>
    );
  }

  return null;
}
