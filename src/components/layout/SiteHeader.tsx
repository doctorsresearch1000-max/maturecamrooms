"use client";

import Image from "next/image";
import Link from "next/link";
import { ModelDirectoryNav } from "@/components/layout/ModelDirectoryNav";
import { useShell } from "@/components/layout/ShellContext";
import { siteConfig } from "@/lib/site";

function SearchIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function SiteHeader() {
  const { setDrawerOpen, setSearchOpen, favorites } = useShell();

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[var(--header-bg)] lg:sticky"
    >
      {/* Mobile: menu · wordmark · search only */}
      <div className="mx-auto grid h-[var(--header-h)] max-w-[1920px] grid-cols-[3.25rem_1fr_3.25rem] items-center px-3 lg:hidden">
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center text-white"
          aria-label="Open menu"
          onClick={() => setDrawerOpen(true)}
        >
          <HamburgerIcon />
        </button>

        <Link href="/" className="flex min-w-0 justify-center px-1">
          <Image
            src="/maturecamrooms-logo.png"
            alt={siteConfig.name}
            width={747}
            height={59}
            className="h-[1.375rem] w-auto max-w-[min(58vw,12.5rem)]"
            priority
          />
        </Link>

        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex h-11 w-11 items-center justify-center text-white"
          aria-label="Search models"
        >
          <SearchIcon />
        </button>
      </div>

      {/* Desktop */}
      <div className="mx-auto hidden h-[var(--header-h)] max-w-[1920px] items-center gap-2 px-4 lg:flex lg:px-6">
        <Link href="/" className="flex shrink-0 items-center lg:mr-2">
          <Image
            src="/maturecamrooms-logo.png"
            alt={siteConfig.name}
            width={747}
            height={59}
            className="h-10 w-auto max-w-[15.5rem]"
            priority
          />
        </Link>

        <div className="min-w-0 flex-1">
          <ModelDirectoryNav variant="header" />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex min-h-[40px] min-w-[160px] max-w-xs items-center gap-2 rounded-full border border-border bg-surface-elevated px-3 text-left text-base text-text-muted transition hover:border-accent/30"
            aria-label="Search models"
          >
            <SearchIcon />
            <span className="truncate text-base text-text-secondary">
              Search models…
            </span>
          </button>
          <button
            type="button"
            className="relative flex h-10 min-w-[40px] items-center justify-center rounded-md px-2 text-sm font-medium text-text-secondary hover:bg-surface-hover"
            aria-label={`Favorites, ${favorites.size} saved`}
            onClick={() => setDrawerOpen(true)}
          >
            ♥
            {favorites.size > 0 ? (
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                {favorites.size}
              </span>
            ) : null}
          </button>
          <div className="flex gap-2">
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
