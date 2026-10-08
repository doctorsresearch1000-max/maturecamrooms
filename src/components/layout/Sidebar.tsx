"use client";

import Image from "next/image";
import Link from "next/link";
import { useShell } from "@/components/layout/ShellContext";
import { Drawer } from "@/components/ui/Drawer";
import { siteConfig } from "@/lib/site";

const PRIMARY = [
  { href: "/", label: "Home" },
  { href: "/?filter=live", label: "Live now" },
  { href: "/?filter=all", label: "All models" },
  { href: "/category/mature", label: "Mature" },
  { href: "/category/milf", label: "MILF" },
  { href: "/category/cougar", label: "Cougar" },
];

const PERSONAL = [
  { href: "/#favorites", label: "Favorites" },
  { href: "/?filter=new", label: "History" },
];

const FILTER_GROUPS = [
  {
    title: "Age",
    items: ["40+", "45+", "50+", "55+", "60+"],
  },
  {
    title: "Body",
    items: ["Petite", "Average", "Curvy", "BBW"],
  },
  {
    title: "Hair",
    items: ["Blonde", "Brunette", "Redhead", "Black", "Grey"],
  },
  {
    title: "Popular",
    items: ["Most viewed", "Trending", "New", "Recently online"],
  },
];

function SidebarNav({
  onNavigate,
  favoritesCount,
}: {
  onNavigate?: () => void;
  favoritesCount?: number;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-3 text-sm lg:gap-6 lg:p-4">
      <div className="lg:hidden">
        <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">
          Your list
        </p>
        <ul className="space-y-0.5">
          {PERSONAL.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className="flex min-h-[44px] items-center justify-between rounded-lg px-3 font-medium text-foreground transition hover:bg-surface-hover"
              >
                {item.label}
                {item.label === "Favorites" &&
                favoritesCount &&
                favoritesCount > 0 ? (
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-semibold text-accent">
                    {favoritesCount}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-text-muted lg:mb-2 lg:px-0">
          Browse
        </p>
        <ul className="space-y-0.5">
          {PRIMARY.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className="flex min-h-[44px] items-center rounded-lg px-3 font-medium text-foreground transition hover:bg-surface-hover lg:rounded-md"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {FILTER_GROUPS.map((group) => (
        <div key={group.title}>
          <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-text-muted lg:mb-2 lg:px-0">
            {group.title}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  className="flex w-full min-h-[40px] items-center rounded-lg px-3 text-left text-text-secondary transition hover:bg-surface-hover hover:text-foreground lg:rounded-md"
                  onClick={onNavigate}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="px-2 text-[11px] text-text-muted lg:px-0">
        Extended filters connect when the live API is wired.
      </p>
    </nav>
  );
}

export function SidebarDesktop() {
  return (
    <aside
      className="hidden w-56 shrink-0 border-r border-border bg-surface lg:block"
      aria-label="Filters and categories"
    >
      <SidebarNav />
    </aside>
  );
}

export function SidebarMobile() {
  const { drawerOpen, setDrawerOpen, favorites } = useShell();
  return (
    <Drawer
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      ariaLabel="Navigation menu"
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <Link
          href="/"
          className="min-w-0 flex-1"
          onClick={() => setDrawerOpen(false)}
        >
          <Image
            src="/maturecamrooms-logo.png"
            alt={siteConfig.name}
            width={747}
            height={59}
            className="h-7 w-auto max-w-[11rem]"
          />
        </Link>
        <button
          type="button"
          onClick={() => setDrawerOpen(false)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover"
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 border-b border-border px-3 py-2.5">
        <button
          type="button"
          className="min-h-[40px] rounded-lg border border-border bg-surface-elevated text-sm font-semibold text-foreground"
        >
          Login
        </button>
        <button
          type="button"
          className="min-h-[40px] rounded-lg bg-accent text-sm font-semibold text-white"
        >
          Join free
        </button>
      </div>
      <SidebarNav
        onNavigate={() => setDrawerOpen(false)}
        favoritesCount={favorites.size}
      />
    </Drawer>
  );
}
