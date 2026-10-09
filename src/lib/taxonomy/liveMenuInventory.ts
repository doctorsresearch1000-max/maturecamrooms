import { filterModelsByCategory } from "@/lib/seo/filters";
import { CATEGORY_DISPLAY, SITE_CATEGORIES, type SiteCategory } from "@/lib/seo/config";
import { categoryPath, countryPath } from "@/lib/seo/slug";
import {
  agePath,
  ethnicityPath,
  hairPath,
} from "@/lib/seo/slug";
import type { CamModel } from "@/lib/models/types";
import { countryLabel } from "@/lib/country";
import { slugify } from "@/lib/seo/slug";
import {
  AGE_FACET_DEFS,
  ethnicitySlug,
  filterModelsByAgeBand,
  hairSlug,
} from "@/lib/taxonomy/facetFilters";
import {
  FACET_CANONICAL_OVERLAP_RATIO,
  FACET_MIN_MODEL_COUNT,
  NICHE_CANONICAL_PRIORITY,
} from "@/lib/taxonomy/constants";

export type MenuFacetItem = {
  slug: string;
  label: string;
  href: string;
  count: number;
  icon?: string;
};

export type LiveMenuInventory = {
  feedOk: boolean;
  liveCount: number;
  niches: MenuFacetItem[];
  ageBands: MenuFacetItem[];
  ethnicities: MenuFacetItem[];
  hairs: MenuFacetItem[];
  countries: MenuFacetItem[];
  headerChips: MenuFacetItem[];
  nicheCanonicalTo: Record<string, string>;
  indexableAge: Set<string>;
  indexableEthnicity: Set<string>;
  indexableHair: Set<string>;
};

function overlapRatio(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const id of a) if (b.has(id)) inter++;
  return inter / Math.min(a.size, b.size);
}

function buildNicheCanonicalMap(
  pool: CamModel[],
): Record<string, string> {
  const sets: Record<string, Set<string>> = {};
  for (const slug of SITE_CATEGORIES) {
    sets[slug] = new Set(
      filterModelsByCategory(pool, slug).map((m) => m.id),
    );
  }
  const canonicalTo: Record<string, string> = {};
  const priorityIndex = new Map(
    NICHE_CANONICAL_PRIORITY.map((s, i) => [s, i]),
  );

  for (const secondary of SITE_CATEGORIES) {
    for (const primary of SITE_CATEGORIES) {
      if (secondary === primary) continue;
      const pi = priorityIndex.get(primary) ?? 99;
      const si = priorityIndex.get(secondary) ?? 99;
      if (pi >= si) continue;
      const ratio = overlapRatio(sets[primary], sets[secondary]);
      if (ratio >= FACET_CANONICAL_OVERLAP_RATIO) {
        canonicalTo[secondary] = primary;
      }
    }
  }
  return canonicalTo;
}

function facetIcon(kind: string, slug: string): string {
  if (kind === "niche") {
    if (slug === "milf") return "✦";
    if (slug === "cougar") return "◇";
    if (slug === "mom") return "♡";
    return "●";
  }
  if (kind === "age") return "🎂";
  if (kind === "ethnicity") return "🌎";
  if (kind === "hair") return "💇";
  if (kind === "country") return "🏳️";
  return "•";
}

function countFacet(
  pool: CamModel[],
  slug: string,
  counter: (models: CamModel[], slug: string) => CamModel[],
): number {
  return counter(pool, slug).length;
}

export function buildLiveMenuInventory(
  pool: CamModel[],
  feedOk: boolean,
): LiveMenuInventory {
  const livePool = pool.filter((m) => m.isLive);
  const liveCount = livePool.length;
  const nicheCanonicalTo = feedOk ? buildNicheCanonicalMap(livePool) : {};

  const niches: MenuFacetItem[] = [];
  if (feedOk) {
    for (const slug of SITE_CATEGORIES) {
      const count = countFacet(livePool, slug, filterModelsByCategory);
      if (count < FACET_MIN_MODEL_COUNT) continue;
      if (nicheCanonicalTo[slug]) continue;
      niches.push({
        slug,
        label: CATEGORY_DISPLAY[slug as SiteCategory],
        href: categoryPath(slug),
        count,
        icon: facetIcon("niche", slug),
      });
    }
  }

  const ageBands: MenuFacetItem[] = [];
  const indexableAge = new Set<string>();
  if (feedOk) {
    for (const def of AGE_FACET_DEFS) {
      const count = filterModelsByAgeBand(livePool, def.slug).length;
      if (count < FACET_MIN_MODEL_COUNT) continue;
      indexableAge.add(def.slug);
      ageBands.push({
        slug: def.slug,
        label: def.label,
        href: agePath(def.slug),
        count,
        icon: facetIcon("age", def.slug),
      });
    }
  }

  const ethnicities: MenuFacetItem[] = [];
  const indexableEthnicity = new Set<string>();
  if (feedOk) {
    const counts = new Map<string, { label: string; count: number }>();
    for (const model of livePool) {
      const slug = ethnicitySlug(model);
      if (!slug) continue;
      const label = model.ethnicity ?? slug;
      const prev = counts.get(slug);
      if (prev) prev.count += 1;
      else counts.set(slug, { label, count: 1 });
    }
    for (const [slug, { label, count }] of counts) {
      if (count < FACET_MIN_MODEL_COUNT) continue;
      indexableEthnicity.add(slug);
      ethnicities.push({
        slug,
        label,
        href: ethnicityPath(slug),
        count,
        icon: facetIcon("ethnicity", slug),
      });
    }
    ethnicities.sort((a, b) => b.count - a.count);
  }

  const hairs: MenuFacetItem[] = [];
  const indexableHair = new Set<string>();
  if (feedOk) {
    const counts = new Map<string, { label: string; count: number }>();
    for (const model of livePool) {
      const slug = hairSlug(model);
      if (!slug) continue;
      const label = model.hair ?? slug;
      const prev = counts.get(slug);
      if (prev) prev.count += 1;
      else counts.set(slug, { label, count: 1 });
    }
    for (const [slug, { label, count }] of counts) {
      if (count < FACET_MIN_MODEL_COUNT) continue;
      indexableHair.add(slug);
      hairs.push({
        slug,
        label: `${label} hair`,
        href: hairPath(slug),
        count,
        icon: facetIcon("hair", slug),
      });
    }
    hairs.sort((a, b) => b.count - a.count);
  }

  const countries: MenuFacetItem[] = [];
  if (feedOk) {
    const counts = new Map<string, { label: string; count: number }>();
    for (const model of livePool) {
      const label = countryLabel(model.countryCode, model.country);
      if (!label) continue;
      const slug = slugify(label);
      const prev = counts.get(slug);
      if (prev) prev.count += 1;
      else counts.set(slug, { label, count: 1 });
    }
    for (const [slug, { label, count }] of counts) {
      if (count < FACET_MIN_MODEL_COUNT) continue;
      countries.push({
        slug,
        label,
        href: countryPath(slug),
        count,
        icon: facetIcon("country", slug),
      });
    }
    countries.sort((a, b) => b.count - a.count);
  }

  const headerChips: MenuFacetItem[] = [
    ...niches.slice(0, 3),
    ...ageBands.slice(0, 2),
    ...ethnicities.slice(0, 2),
    ...hairs.slice(0, 1),
  ].slice(0, 8);

  return {
    feedOk,
    liveCount,
    niches,
    ageBands,
    ethnicities,
    hairs,
    countries,
    headerChips,
    nicheCanonicalTo,
    indexableAge,
    indexableEthnicity,
    indexableHair,
  };
}

export function nicheCanonicalHref(
  slug: string,
  nicheCanonicalTo: Record<string, string>,
): string | undefined {
  const primary = nicheCanonicalTo[slug];
  if (!primary) return undefined;
  return categoryPath(primary);
}
