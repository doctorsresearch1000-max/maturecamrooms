"use client";

import Link from "next/link";
import {
  DRAWER_AGE_LINKS,
  DRAWER_POPULAR_LINKS,
  DRAWER_PRIMARY_LINKS,
} from "@/lib/navigation/drawerMenu";
import { useDrawerMenu } from "@/hooks/useDrawerMenu";

const linkClass =
  "shrink-0 rounded-full border border-white/[0.08] bg-surface-elevated px-2.5 py-1 text-[11px] font-semibold text-white hover:border-accent/40";

/** Mobile header row: same browse targets as the drawer menu (compact). */
export function MobileHeaderCategories() {
  const { categories, ageBands, ethnicities, hairs, loading, catalogOk } =
    useDrawerMenu(true);

  const facetLinks = catalogOk
    ? [
        ...categories.map((c) => ({ id: c.slug, label: c.label, href: c.href })),
        ...ageBands.slice(0, 4).map((c) => ({
          id: `age-${c.slug}`,
          label: c.label,
          href: c.href,
        })),
        ...ethnicities.slice(0, 3).map((c) => ({
          id: `eth-${c.slug}`,
          label: c.label,
          href: c.href,
        })),
        ...hairs.slice(0, 2).map((c) => ({
          id: `hair-${c.slug}`,
          label: c.label,
          href: c.href,
        })),
      ]
    : [
        ...DRAWER_AGE_LINKS,
        ...DRAWER_POPULAR_LINKS,
      ];

  const links = [
    ...DRAWER_PRIMARY_LINKS,
    ...facetLinks,
  ];

  return (
    <nav
      className="border-t border-white/[0.06] px-2 py-1.5 lg:hidden"
      aria-label="Browse categories"
    >
      <ul
        className={`scrollbar-none flex items-center gap-1.5 overflow-x-auto ${
          loading ? "opacity-60" : ""
        }`}
        role="list"
      >
        {links.map((item) => (
          <li key={item.id}>
            <Link href={item.href} className={linkClass}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
