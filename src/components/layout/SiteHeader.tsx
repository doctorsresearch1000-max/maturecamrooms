"use client";

import Image from "next/image";
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
      className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md"
    >
      <div className="mx-auto flex h-[var(--header-h)] max-w-[1920px] items-center gap-1 px-2 sm:gap-2 sm:px-4 lg:px-6">
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-foreground hover:bg-surface-hover lg:hidden"
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
          className="flex min-w-0 flex-1 items-center justify-center lg:flex-none lg:justify-start"
        >
          <Image
            src="/maturecamrooms-logo.png"
            alt={siteConfig.name}
            width={747}
            height={59}
            className="h-[1.65rem] w-auto max-w-[min(72vw,15.5rem)] sm:h-9 lg:h-10"
            priority
          />
          <span className="ml-2 hidden text-[10px] uppercase tracking-widest text-text-muted lg:inline">
            Mature · MILF · Cougar
          </span>
        </Link>

        <nav
          className="ml-2 hidden flex-1 items-center gap-1 lg:flex"
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

        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-md text-lg text-text-secondary hover:bg-surface-hover hover:text-foreground lg:min-w-[44px] lg:px-3 lg:text-sm lg:font-medium"
            aria-label="Search models"
          >
            <span className="lg:hidden" aria-hidden>⌕</span>
            <span className="hidden lg:inline">Search</span>
            <span className="hidden lg:ml-1 lg:inline" aria-hidden>⌕</span>
          </button>
          <button
            type="button"
            className="relative hidden h-11 min-w-[44px] items-center justify-center rounded-md px-3 text-sm font-medium text-text-secondary hover:bg-surface-hover sm:flex"
            aria-label={`Favorites, ${favorites.size} saved`}
            onClick={() => setDrawerOpen(true)}
          >
            ♥
            {favorites.size > 0 ? (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                {favorites.size}
              </span>
            ) : null}
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
