"use client";

import Image from "next/image";
import Link from "next/link";
import { ModelDirectoryNav } from "@/components/layout/ModelDirectoryNav";
import { useShell } from "@/components/layout/ShellContext";
import { siteConfig } from "@/lib/site";

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
          className="flex shrink-0 items-center lg:mr-2"
        >
          <Image
            src="/maturecamrooms-logo.png"
            alt={siteConfig.name}
            width={747}
            height={59}
            className="h-[1.65rem] w-auto max-w-[min(42vw,11rem)] sm:h-9 lg:h-10 lg:max-w-[15.5rem]"
            priority
          />
        </Link>

        <div className="hidden min-w-0 lg:flex lg:flex-1">
          <ModelDirectoryNav variant="header" />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex min-h-[40px] min-w-[120px] max-w-[200px] flex-1 items-center gap-2 rounded-full border border-border bg-surface-elevated px-3 text-left text-base text-text-muted transition hover:border-accent/30 sm:min-w-[160px] lg:max-w-xs"
            aria-label="Search models"
          >
            <span className="text-text-secondary" aria-hidden>⌕</span>
            <span className="truncate text-base">Search models…</span>
          </button>
          <button
            type="button"
            className="relative hidden h-10 min-w-[40px] items-center justify-center rounded-md px-2 text-sm font-medium text-text-secondary hover:bg-surface-hover sm:flex"
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
