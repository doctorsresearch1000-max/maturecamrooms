"use client";

import Link from "next/link";
import { useShell } from "@/components/layout/ShellContext";
import { siteConfig } from "@/lib/site";

const DESKTOP_NAV = [
  { href: "/", label: "Live" },
  { href: "/category/mature", label: "Mature" },
  { href: "/category/milf", label: "MILF" },
  { href: "/category/cougar", label: "Cougar" },
];

export function SiteHeader() {
  const { setDrawerOpen, setSearchOpen, favorites } = useShell();

  return (
    <header
      className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md"
    >
      <div className="mx-auto flex h-[var(--header-h)] max-w-[1920px] items-center gap-2 px-3 sm:px-4 lg:px-6">
        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-foreground hover:bg-surface-hover lg:hidden"
          aria-label="Open menu"
          onClick={() => setDrawerOpen(true)}
        >
          <span className="flex flex-col gap-1.5" aria-hidden>
            <span className="block h-0.5 w-5 bg-current" />
            <span className="block h-0.5 w-5 bg-current" />
            <span className="block h-0.5 w-5 bg-current" />
          </span>
        </button>

        <Link
          href="/"
          className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center leading-tight lg:static lg:translate-x-0 lg:items-start"
        >
          <span className="text-base font-bold tracking-tight text-accent sm:text-lg">
            {siteConfig.name}
          </span>
          <span className="hidden text-[10px] uppercase tracking-widest text-text-muted lg:block">
            Mature · MILF · Cougar
          </span>
        </Link>

        <nav
          className="ml-4 hidden flex-1 items-center gap-1 lg:flex"
          aria-label="Primary"
        >
          {DESKTOP_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-hover hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-11 min-w-[44px] items-center justify-center rounded-md px-3 text-sm font-medium text-text-secondary hover:bg-surface-hover hover:text-foreground"
            aria-label="Search models"
          >
            <span className="hidden sm:inline">Search</span>
            <span className="sm:ml-1" aria-hidden>⌕</span>
          </button>
          <button
            type="button"
            className="relative hidden h-11 min-w-[44px] items-center justify-center rounded-md px-3 text-sm font-medium text-text-secondary hover:bg-surface-hover sm:flex"
            aria-label={`Favorites, ${favorites.size} saved`}
          >
            ♥
            {favorites.size > 0 ? (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                {favorites.size}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-elevated text-sm font-semibold text-foreground hover:bg-surface-hover lg:hidden"
            aria-label="Account"
            onClick={() => setDrawerOpen(true)}
          >
            M
          </button>
          <div className="hidden gap-2 lg:flex">
            <button
              type="button"
              className="rounded-md px-3 py-2 text-sm font-medium text-text-secondary hover:text-foreground"
            >
              Login
            </button>
            <button
              type="button"
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              Join free
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
