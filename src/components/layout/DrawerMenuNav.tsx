"use client";

import Link from "next/link";
import { useState } from "react";
import {
  DRAWER_AGE_LINKS,
  DRAWER_POPULAR_LINKS,
  DRAWER_PRIMARY_LINKS,
} from "@/lib/navigation/drawerMenu";
import { useDrawerMenu } from "@/hooks/useDrawerMenu";

type DrawerMenuNavProps = {
  onNavigate?: () => void;
  favoritesCount?: number;
  onOpenSearch?: () => void;
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
  onNavigate,
  accent,
}: {
  href: string;
  label: string;
  count?: number;
  onNavigate?: () => void;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex min-h-[44px] items-center justify-between rounded-md px-2 text-[15px] font-medium transition ${
        accent
          ? "text-accent"
          : "text-white hover:bg-white/[0.04]"
      }`}
    >
      <span>{label}</span>
      {count !== undefined ? (
        <span
          className={`text-xs font-semibold tabular-nums ${
            count > 0 ? "text-text-muted" : "text-white/25"
          }`}
        >
          {count}
        </span>
      ) : null}
    </Link>
  );
}

export function DrawerMenuNav({
  onNavigate,
  favoritesCount = 0,
  onOpenSearch,
}: DrawerMenuNavProps) {
  const { liveCount, categories, countries, loading } = useDrawerMenu(true);

  return (
    <nav className="flex flex-1 flex-col overflow-y-auto px-2 pb-6 pt-1">
      <div className="mb-3 px-1">
        <p className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-white">
          {loading
            ? "Loading live count…"
            : `${liveCount > 0 ? liveCount : "—"} models online`}
        </p>
      </div>

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

      <ul className="space-y-0.5" role="list">
        {DRAWER_PRIMARY_LINKS.map((item) => (
          <li key={item.id}>
            <NavRow
              href={item.href}
              label={item.label}
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </ul>

      <Section title="Mature niche" defaultOpen>
        {loading && categories.length === 0 ? (
          <p className="px-2 py-2 text-xs text-text-muted">Loading…</p>
        ) : (
          <ul className="space-y-0.5" role="list">
            {(categories.length > 0
              ? categories
              : DRAWER_AGE_LINKS.map((l) => ({
                  slug: l.id,
                  label: l.label.replace(/^.*·\s*/, ""),
                  href: l.href,
                  count: 0,
                }))
            ).map((cat) => (
              <li key={cat.slug}>
                <NavRow
                  href={cat.href}
                  label={cat.label}
                  count={cat.count}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Age & style">
        <ul className="space-y-0.5" role="list">
          {DRAWER_AGE_LINKS.map((item) => (
            <li key={item.id}>
              <NavRow
                href={item.href}
                label={item.label}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Popular filters">
        <ul className="space-y-0.5" role="list">
          {DRAWER_POPULAR_LINKS.map((item) => (
            <li key={item.id}>
              <NavRow
                href={item.href}
                label={item.label}
                onNavigate={onNavigate}
              />
            </li>
          ))}
        </ul>
      </Section>

      {countries.length > 0 ? (
        <Section title="Countries">
          <ul className="space-y-0.5" role="list">
            {countries.map((c) => (
              <li key={c.slug}>
                <NavRow
                  href={c.href}
                  label={c.label}
                  count={c.count}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </nav>
  );
}
