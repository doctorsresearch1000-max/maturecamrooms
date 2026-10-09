"use client";

import Link from "next/link";
import { useState } from "react";
import {
  DRAWER_POPULAR_LINKS,
  DRAWER_PRIMARY_LINKS,
} from "@/lib/navigation/drawerMenu";
import type { TaxonomyCategoryItem } from "@/hooks/useDrawerMenu";

export type TaxonomyMenuNavProps = {
  feedOk: boolean;
  liveCount?: number;
  catalogOk?: boolean;
  catalogCount?: number;
  categories: TaxonomyCategoryItem[];
  segments: TaxonomyCategoryItem[];
  ageBands: TaxonomyCategoryItem[];
  ethnicities: TaxonomyCategoryItem[];
  hairs: TaxonomyCategoryItem[];
  busts: TaxonomyCategoryItem[];
  figures: TaxonomyCategoryItem[];
  countries: TaxonomyCategoryItem[];
  languages: TaxonomyCategoryItem[];
  loading?: boolean;
  onNavigate?: () => void;
  favoritesCount?: number;
  onOpenSearch?: () => void;
  /** drawer: toolbar + mobile; sidebar: desktop sticky nav */
  variant?: "drawer" | "sidebar";
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`shrink-0 text-text-muted transition ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function Section({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-white/[0.06] pt-2">
      <button
        type="button"
        className="flex w-full min-h-[40px] items-center justify-between px-2 text-left"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">
          {title}
        </span>
        <Chevron open={open} />
      </button>
      {open ? <div className="pb-1">{children}</div> : null}
    </div>
  );
}

function NavRow({
  href,
  label,
  count,
  icon,
  onNavigate,
}: {
  href: string;
  label: string;
  count?: number;
  icon?: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex min-h-[44px] items-center justify-between gap-2 rounded-md px-2 text-[15px] font-medium text-white transition hover:bg-white/[0.04]"
    >
      <span className="flex min-w-0 items-center gap-2">
        {icon ? (
          <span className="w-4 shrink-0 text-center text-xs opacity-80" aria-hidden>
            {icon}
          </span>
        ) : null}
        <span className="truncate">{label}</span>
      </span>
      {count !== undefined && count > 0 ? (
        <span className="text-xs font-semibold tabular-nums text-text-muted">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

export function TaxonomyMenuNav({
  feedOk,
  liveCount,
  catalogOk,
  catalogCount,
  categories,
  segments,
  ageBands,
  ethnicities,
  hairs,
  busts,
  figures,
  countries,
  languages,
  loading,
  onNavigate,
  favoritesCount = 0,
  onOpenSearch,
  variant = "drawer",
}: TaxonomyMenuNavProps) {
  const statusLine = loading
    ? "Loading…"
    : feedOk && liveCount !== undefined && liveCount > 0
      ? `${liveCount} live now`
      : catalogOk && catalogCount
        ? `${catalogCount.toLocaleString()} in catalog`
        : "Browse mature cams";

  return (
    <nav
      className={`flex flex-1 flex-col overflow-y-auto px-2 pb-6 pt-1 ${
        variant === "sidebar" ? "text-sm" : ""
      }`}
      aria-label="Browse categories and facets"
    >
      <div className="mb-3 px-1">
        <p className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-white">
          {statusLine}
        </p>
      </div>

      {variant === "drawer" ? (
        <div className="mb-2 flex items-center gap-1 border-b border-white/[0.06] pb-3">
          <button
            type="button"
            className="flex h-10 flex-1 items-center justify-center rounded-md text-white hover:bg-white/[0.04]"
            aria-label="Search"
            onClick={() => {
              onOpenSearch?.();
              onNavigate?.();
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </button>
          <Link
            href="/#favorites"
            onClick={onNavigate}
            className="relative flex h-10 flex-1 items-center justify-center rounded-md text-white hover:bg-white/[0.04]"
            aria-label="Favorites"
          >
            <span aria-hidden>♥</span>
            {favoritesCount > 0 ? (
              <span className="absolute right-2 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white">
                {favoritesCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/?filter=new"
            onClick={onNavigate}
            className="flex h-10 flex-1 items-center justify-center rounded-md text-white hover:bg-white/[0.04]"
            aria-label="Recently online"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </Link>
        </div>
      ) : null}

      <ul className="space-y-0.5" role="list">
        {DRAWER_PRIMARY_LINKS.map((item) => (
          <li key={item.id}>
            <NavRow href={item.href} label={item.label} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>

      {segments.length > 0 ? (
        <Section title="Segments" defaultOpen>
          <ul className="space-y-0.5" role="list">
            {segments.map((item) => (
              <li key={item.slug}>
                <NavRow
                  href={item.href}
                  label={item.label}
                  count={item.count}
                  icon={item.icon}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {categories.length > 0 ? (
        <Section title="Niche" defaultOpen>
          <ul className="space-y-0.5" role="list">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <NavRow
                  href={cat.href}
                  label={cat.label}
                  count={cat.count}
                  icon={cat.icon}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {ageBands.length > 0 ? (
        <Section title="Age">
          <ul className="space-y-0.5" role="list">
            {ageBands.map((item) => (
              <li key={item.slug}>
                <NavRow
                  href={item.href}
                  label={item.label}
                  count={item.count}
                  icon={item.icon}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {ethnicities.length > 0 ? (
        <Section title="Ethnicity">
          <ul className="space-y-0.5" role="list">
            {ethnicities.map((item) => (
              <li key={item.slug}>
                <NavRow
                  href={item.href}
                  label={item.label}
                  count={item.count}
                  icon={item.icon}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {busts.length > 0 ? (
        <Section title="Bust">
          <ul className="space-y-0.5" role="list">
            {busts.map((item) => (
              <li key={item.slug}>
                <NavRow
                  href={item.href}
                  label={item.label}
                  count={item.count}
                  icon={item.icon}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {figures.length > 0 ? (
        <Section title="Figure">
          <ul className="space-y-0.5" role="list">
            {figures.map((item) => (
              <li key={item.slug}>
                <NavRow
                  href={item.href}
                  label={item.label}
                  count={item.count}
                  icon={item.icon}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {hairs.length > 0 ? (
        <Section title="Hair">
          <ul className="space-y-0.5" role="list">
            {hairs.map((item) => (
              <li key={item.slug}>
                <NavRow
                  href={item.href}
                  label={item.label}
                  count={item.count}
                  icon={item.icon}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {countries.length > 0 ? (
        <Section title="Countries">
          <ul className="space-y-0.5" role="list">
            {countries.map((c) => (
              <li key={c.slug}>
                <NavRow
                  href={c.href}
                  label={c.label}
                  count={c.count}
                  icon={c.icon}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {languages.length > 0 ? (
        <Section title="Languages">
          <ul className="space-y-0.5" role="list">
            {languages.slice(0, 12).map((item) => (
              <li key={item.slug}>
                <NavRow
                  href={item.href}
                  label={item.label}
                  count={item.count}
                  icon={item.icon}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section title="Popular filters">
        <ul className="space-y-0.5" role="list">
          {DRAWER_POPULAR_LINKS.map((item) => (
            <li key={item.id}>
              <NavRow href={item.href} label={item.label} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      </Section>
    </nav>
  );
}
