"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useShell } from "@/components/layout/ShellContext";

const ITEMS = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/?filter=live", label: "Live", icon: "●" },
  { href: "/#favorites", label: "Favorites", icon: "♥" },
  { label: "Menu", icon: "☰", action: "menu" as const },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { setDrawerOpen, favorites } = useShell();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Mobile navigation"
    >
      <ul className="flex h-[var(--bottom-nav-h)] items-stretch">
        {ITEMS.map((item) => {
          const active =
            item.href &&
            (item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href.split("?")[0]));
          if (item.action === "menu") {
            return (
              <li key="menu" className="flex-1">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="flex h-full w-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-text-secondary"
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </button>
              </li>
            );
          }
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href!}
                className={`flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${
                  active ? "text-accent" : "text-text-secondary"
                }`}
              >
                <span className="relative text-lg">
                  {item.icon}
                  {item.label === "Favorites" && favorites.size > 0 ? (
                    <span className="absolute -right-2 -top-1 h-2 w-2 rounded-full bg-accent" />
                  ) : null}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
