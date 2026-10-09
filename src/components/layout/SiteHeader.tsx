"use client";

import Image from "next/image";
import Link from "next/link";
import { HeaderFacetChips } from "@/components/discovery/HeaderFacetChips";
import { HeaderModelStories } from "@/components/layout/HeaderModelStories";
import { useShell } from "@/components/layout/ShellContext";
import { siteConfig } from "@/lib/site";

const MAIN_PAD = "px-2 sm:px-4 lg:px-6";

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
  const { setDrawerOpen } = useShell();

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[var(--header-bg)] lg:sticky [--header-stack-h:var(--header-h-mobile)] lg:[--header-stack-h:var(--header-h-desktop-stack)]"
    >
      {/* Mobile: logo + menú (categorías solo en FilterBar debajo) */}
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

          <span className="w-10" aria-hidden />
        </div>
      </div>

      {/* Desktop: menú desplegable · stories · chips a ancho completo */}
      <div className="mx-auto hidden max-w-[1920px] lg:block">
        <div className={`flex h-14 items-center gap-3 ${MAIN_PAD}`}>
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-white hover:bg-white/[0.06]"
            aria-label="Open browse menu"
            onClick={() => setDrawerOpen(true)}
          >
            <HamburgerIcon />
          </button>

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
        </div>

        <HeaderFacetChips fullWidth />
      </div>
    </header>
  );
}
