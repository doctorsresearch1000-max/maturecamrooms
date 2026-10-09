import { AGE_FACET_DEFS } from "@/lib/taxonomy/facetFilters";

export function labelFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function ageBandLabel(slug: string): string {
  const found = AGE_FACET_DEFS.find((d) => d.slug === slug);
  return found?.label ?? labelFromSlug(slug);
}
