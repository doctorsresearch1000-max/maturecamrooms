"use client";

import Link from "next/link";
import { useShell } from "@/components/layout/ShellContext";
import { Drawer } from "@/components/ui/Drawer";

const PRIMARY = [
  { href: "/", label: "Home" },
  { href: "/?filter=live", label: "Live now" },
  { href: "/?filter=all", label: "All models" },
  { href: "/category/mature", label: "Mature" },
  { href: "/category/milf", label: "MILF" },
  { href: "/category/cougar", label: "Cougar" },
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

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 text-sm">
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">
          Browse
        </p>
        <ul className="space-y-0.5">
          {PRIMARY.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className="flex min-h-[44px] items-center rounded-md px-3 font-medium text-foreground transition hover:bg-surface-hover"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {FILTER_GROUPS.map((group) => (
        <div key={group.title}>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">
            {group.title}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  className="flex w-full min-h-[40px] items-center rounded-md px-3 text-left text-text-secondary transition hover:bg-surface-hover hover:text-foreground"
                  onClick={onNavigate}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="text-[11px] text-text-muted">
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
  const { drawerOpen, setDrawerOpen } = useShell();
  return (
    <Drawer
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      ariaLabel="Navigation menu"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="font-bold text-accent">Menu</span>
        <button
          type="button"
          onClick={() => setDrawerOpen(false)}
          className="min-h-[44px] min-w-[44px] rounded-md text-text-secondary hover:bg-surface-hover"
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>
      <SidebarNav onNavigate={() => setDrawerOpen(false)} />
    </Drawer>
  );
}
