"use client";

import Image from "next/image";
import Link from "next/link";
import { HeaderModelStories } from "@/components/layout/HeaderModelStories";
import { MobileHeaderCategories } from "@/components/layout/MobileHeaderCategories";
import { useShell } from "@/components/layout/ShellContext";
import { siteConfig } from "@/lib/site";

/** Matches main column horizontal padding (HomeDiscovery). */
const MAIN_PAD = "px-2 sm:px-4 lg:px-6";

function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
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
      width="20"
      height="20"
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
      className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[var(--header-bg)] lg:sticky lg:[--header-stack-h:var(--header-h)] [--header-stack-h:var(--header-h-mobile)]"
    >
      {/* Mobile: logo left-aligned + categories below */}
      <div className="lg:hidden">
        <div
          className={`mx-auto grid h-14 max-w-[1920px] grid-cols-[2.75rem_1fr_2.75rem] items-center ${MAIN_PAD}`}
        >
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center text-white -ml-1"
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
          >
            <HamburgerIcon />
          </button>

          <Link href="/" className="flex min-w-0 items-center justify-start">
            <Image
              src="/maturecamrooms-logo.png"
              alt={siteConfig.name}
              width={747}
              height={59}
              className="h-7 w-auto max-w-[10.5rem]"
              priority
            />
          </Link>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-10 w-10 items-center justify-center justify-self-end text-white"
            aria-label="Search models"
          >
            <SearchIcon />
          </button>
        </div>
        <MobileHeaderCategories />
      </div>

      {/* Desktop: offset by sidebar width so logo aligns with card grid */}
      <div className="mx-auto hidden max-w-[1920px] lg:flex">
        <div
          className="hidden w-56 shrink-0 border-r border-transparent lg:block"
          aria-hidden
        />
        <div
          className={`flex min-h-[var(--header-h)] min-w-0 flex-1 items-center gap-3 ${MAIN_PAD}`}
        >
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/maturecamrooms-logo.png"
              alt={siteConfig.name}
              width={747}
              height={59}
              className="h-8 w-auto max-w-[11.5rem]"
              priority
            />
          </Link>

          <div className="min-w-0 flex-1">
            <HeaderModelStories />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex min-h-[40px] min-w-[10rem] max-w-[14rem] items-center gap-2 rounded-full border border-border bg-surface-elevated px-3 text-left text-sm text-text-muted transition hover:border-accent/30"
              aria-label="Search models"
            >
              <SearchIcon />
              <span className="truncate text-text-secondary">Search models…</span>
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
          </div>
        </div>
      </div>
    </header>
  );
}
