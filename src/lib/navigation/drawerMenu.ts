import { CATEGORY_DISPLAY, NAV_SITE_CATEGORIES } from "@/lib/seo/config";
import { categoryPath } from "@/lib/seo/slug";

export type DrawerNavLink = {
  id: string;
  label: string;
  href: string;
  count?: number;
};

export type DrawerNavSection = {
  id: string;
  title: string;
  links: DrawerNavLink[];
  defaultOpen?: boolean;
};

/** Primary browse row (no male / no auth). */
export const DRAWER_PRIMARY_LINKS: DrawerNavLink[] = [
  { id: "home", label: "Home", href: "/?filter=all" },
  { id: "live", label: "Live now", href: "/?filter=live" },
  { id: "all", label: "All models", href: "/?filter=all" },
  { id: "popular", label: "Popular", href: "/?filter=popular" },
  { id: "new", label: "New online", href: "/?filter=new" },
];

export function nicheCategoryLinks(
  counts: Record<string, number>,
): DrawerNavLink[] {
  return NAV_SITE_CATEGORIES.map((slug) => ({
    id: slug,
    label: CATEGORY_DISPLAY[slug],
    href: categoryPath(slug),
    count: counts[slug] ?? 0,
  }));
}

export const DRAWER_AGE_LINKS: DrawerNavLink[] = [
  { id: "age-milf", label: "30s · MILF", href: "/category/milf" },
  { id: "age-mature", label: "40+ · Mature", href: "/category/mature" },
];

export const DRAWER_POPULAR_LINKS: DrawerNavLink[] = [
  { id: "f-milf", label: "MILF cams", href: "/?filter=milf" },
  { id: "f-mature", label: "Mature cams", href: "/?filter=mature" },
];
