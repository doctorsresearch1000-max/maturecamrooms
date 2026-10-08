"use client";

import Image from "next/image";
import Link from "next/link";
import { ModelDirectoryNav } from "@/components/layout/ModelDirectoryNav";
import { useShell } from "@/components/layout/ShellContext";
import { Drawer } from "@/components/ui/Drawer";
import { siteConfig } from "@/lib/site";

const PERSONAL = [
  { href: "/#favorites", label: "Favorites" },
  { href: "/?filter=new", label: "History" },
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

      <ModelDirectoryNav variant="drawer" onNavigate={onNavigate} />

      <div className="hidden lg:block">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">
          Quick links
        </p>
        <ul className="space-y-0.5">
          <li>
            <Link
              href="/"
              onClick={onNavigate}
              className="flex min-h-[44px] items-center rounded-md px-3 font-medium text-foreground hover:bg-surface-hover"
            >
              Live now
            </Link>
          </li>
          <li>
            <Link
              href="/?filter=all"
              onClick={onNavigate}
              className="flex min-h-[44px] items-center rounded-md px-3 font-medium text-foreground hover:bg-surface-hover"
            >
              All models
            </Link>
          </li>
        </ul>
      </div>
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
