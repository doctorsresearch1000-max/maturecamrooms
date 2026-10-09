import { filterModelsByCategory } from "@/lib/seo/filters";
import {
  CATEGORY_DISPLAY,
  SITE_CATEGORIES,
  type SiteCategory,
} from "@/lib/seo/config";
import {
  agePath,
  bustPath,
  categoryPath,
  comboPath,
  countryPath,
  ethnicityPath,
  figurePath,
  hairPath,
  languagePath,
  slugify,
} from "@/lib/seo/slug";
import { countryLabel } from "@/lib/country";
import type { CamModel } from "@/lib/models/types";
import {
  AGE_FACET_DEFS,
  bustSlug,
  countryFacetSlug,
  ethnicitySlug,
  figureSlug,
  filterModelsByAgeBand,
  filterModelsByEthnicity,
  filterModelsByHair,
  hairSlug,
} from "@/lib/taxonomy/facetFilters";
import {
  FACET_MENU_MIN_COUNT,
  FACET_SITEMAP_MIN_COUNT,
} from "@/lib/taxonomy/constants";
import type { TaxonomyIndexabilityContext } from "@/lib/seo/taxonomyInventory";
import { buildNicheCanonicalMap, nicheCanonicalHref } from "@/lib/taxonomy/liveMenuInventory";
import type { MenuFacetItem } from "@/lib/taxonomy/liveMenuInventory";

export type CatalogMenuInventory = {
  catalogOk: boolean;
  catalogCount: number;
  segments: MenuFacetItem[];
  niches: MenuFacetItem[];
  ageBands: MenuFacetItem[];
  ethnicities: MenuFacetItem[];
  hairs: MenuFacetItem[];
  busts: MenuFacetItem[];
  figures: MenuFacetItem[];
  countries: MenuFacetItem[];
  languages: MenuFacetItem[];
  headerChips: MenuFacetItem[];
  nicheCanonicalTo: Record<string, string>;
};

export type ComboLanding = {
  slug: string;
  href: string;
  count: number;
  title: string;
  description: string;
  h1: string;
  intro: string;
  match: (models: CamModel[]) => CamModel[];
};

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
  if (kind === "bust") return "◆";
  if (kind === "figure") return "◇";
  if (kind === "language") return "💬";
  return "•";
}

function countFacet(
  pool: CamModel[],
  slug: string,
  counter: (models: CamModel[], slug: string) => CamModel[],
): number {
  return counter(pool, slug).length;
}

function topLanguages(pool: CamModel[]): { slug: string; label: string; count: number }[] {
  const counts = new Map<string, { label: string; count: number }>();
  for (const model of pool) {
    for (const lang of model.languages ?? []) {
      const label = lang.trim();
      if (!label) continue;
      const slug = slugify(label);
      const prev = counts.get(slug);
      if (prev) prev.count += 1;
      else counts.set(slug, { label, count: 1 });
    }
  }
  return [...counts.entries()]
    .map(([slug, { label, count }]) => ({ slug, label, count }))
    .sort((a, b) => b.count - a.count);
}

function meanAge(models: CamModel[]): number | null {
  const ages = models.map((m) => m.age).filter((a): a is number => typeof a === "number");
  if (!ages.length) return null;
  return Math.round(ages.reduce((s, a) => s + a, 0) / ages.length);
}

function topCountries(models: CamModel[], n = 3): string[] {
  const c = new Map<string, number>();
  for (const m of models) {
    const label = countryLabel(m.countryCode, m.country);
    if (!label) continue;
    c.set(label, (c.get(label) ?? 0) + 1);
  }
  return [...c.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([label]) => label);
}

export function buildComboLandings(pool: CamModel[], minCount: number): ComboLanding[] {
  const combos: ComboLanding[] = [];
  const countrySlugs = new Map<string, string>();
  for (const m of pool) {
    const slug = countryFacetSlug(m);
    const label = countryLabel(m.countryCode, m.country);
    if (slug && label) countrySlugs.set(slug, label);
  }

  for (const [countrySlug, countryLabelText] of countrySlugs) {
    for (const age of AGE_FACET_DEFS) {
      const slug = `country-${countrySlug}-age-${age.slug}`;
      const match = (models: CamModel[]) =>
        filterModelsByAgeBand(
          filterModelsByCountrySlug(models, countrySlug),
          age.slug,
        );
      const matched = match(pool);
      if (matched.length < minCount) continue;
      const avg = meanAge(matched);
      combos.push({
        slug,
        href: comboPath(slug),
        count: matched.length,
        title: `${countryLabelText} ${age.label} mature cams (${matched.length} models)`,
        description: `Browse ${matched.length} mature & MILF cam models from ${countryLabelText} aged ${age.label}. Live and offline profiles — 18+ only.`,
        h1: `${countryLabelText} cam models · ${age.label}`,
        intro: `We list ${matched.length} performer profiles from ${countryLabelText} in the ${age.label} age band${avg ? ` (average age ${avg})` : ""}. Top languages: ${topLanguages(matched).slice(0, 3).map((l) => l.label).join(", ") || "English"}.`,
        match,
      });
    }
  }

  const hairSlugs = new Map<string, string>();
  for (const m of pool) {
    const slug = hairSlug(m);
    if (slug && m.hair) hairSlugs.set(slug, m.hair);
  }
  for (const [hairSlugKey, hairLabel] of hairSlugs) {
    for (const age of AGE_FACET_DEFS) {
      const slug = `hair-${hairSlugKey}-age-${age.slug}`;
      const match = (models: CamModel[]) =>
        filterModelsByAgeBand(
          filterModelsByHair(models, hairSlugKey),
          age.slug,
        );
      const matched = match(pool);
      if (matched.length < minCount) continue;
      combos.push({
        slug,
        href: comboPath(slug),
        count: matched.length,
        title: `${hairLabel} hair · ${age.label} mature cams`,
        description: `${matched.length} ${hairLabel.toLowerCase()}-hair mature cam models aged ${age.label}. Watch live or browse offline schedules.`,
        h1: `${hairLabel} hair · ages ${age.label}`,
        intro: `${matched.length} catalog models combine ${hairLabel.toLowerCase()} hair with ages ${age.label}. Countries: ${topCountries(matched).join(", ")}.`,
        match,
      });
    }
  }

  return combos;
}

function filterModelsByCountrySlug(models: CamModel[], countrySlug: string): CamModel[] {
  const slug = slugify(countrySlug);
  return models.filter((m) => countryFacetSlug(m) === slug);
}

export function buildCatalogMenuInventory(
  pool: CamModel[],
  catalogOk: boolean,
): CatalogMenuInventory {
  const nicheCanonicalTo = catalogOk ? buildNicheCanonicalMap(pool) : {};
  const menuMin = catalogOk ? FACET_MENU_MIN_COUNT : Number.POSITIVE_INFINITY;

  const niches: MenuFacetItem[] = [];
  if (catalogOk) {
    for (const slug of SITE_CATEGORIES) {
      const count = countFacet(pool, slug, filterModelsByCategory);
      if (count < menuMin) continue;
      const canon = nicheCanonicalHref(slug, nicheCanonicalTo);
      if (canon) continue;
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
  if (catalogOk) {
    for (const def of AGE_FACET_DEFS) {
      const matched = filterModelsByAgeBand(pool, def.slug);
      if (matched.length < menuMin) continue;
      ageBands.push({
        slug: def.slug,
        label: def.label,
        href: agePath(def.slug),
        count: matched.length,
        icon: facetIcon("age", def.slug),
      });
    }
  }

  const ethnicities: MenuFacetItem[] = [];
  const ethnicityCounts = new Map<string, { label: string; count: number }>();
  if (catalogOk) {
    for (const model of pool) {
      const slug = ethnicitySlug(model);
      if (!slug || !model.ethnicity) continue;
      const prev = ethnicityCounts.get(slug);
      if (prev) prev.count += 1;
      else ethnicityCounts.set(slug, { label: model.ethnicity, count: 1 });
    }
    for (const [slug, { label, count }] of ethnicityCounts) {
      if (count < menuMin) continue;
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
  const hairCounts = new Map<string, { label: string; count: number }>();
  if (catalogOk) {
    for (const model of pool) {
      const slug = hairSlug(model);
      if (!slug || !model.hair) continue;
      const prev = hairCounts.get(slug);
      if (prev) prev.count += 1;
      else hairCounts.set(slug, { label: model.hair, count: 1 });
    }
    for (const [slug, { label, count }] of hairCounts) {
      if (count < menuMin) continue;
      hairs.push({
        slug,
        label,
        href: hairPath(slug),
        count,
        icon: facetIcon("hair", slug),
      });
    }
    hairs.sort((a, b) => b.count - a.count);
  }

  const busts: MenuFacetItem[] = [];
  const bustCounts = new Map<string, { label: string; count: number }>();
  if (catalogOk) {
    for (const model of pool) {
      const slug = bustSlug(model);
      if (!slug || !model.bustSize) continue;
      const prev = bustCounts.get(slug);
      if (prev) prev.count += 1;
      else bustCounts.set(slug, { label: model.bustSize, count: 1 });
    }
    for (const [slug, { label, count }] of bustCounts) {
      if (count < menuMin) continue;
      busts.push({
        slug,
        label,
        href: bustPath(slug),
        count,
        icon: facetIcon("bust", slug),
      });
    }
    busts.sort((a, b) => b.count - a.count);
  }

  const figures: MenuFacetItem[] = [];
  const figureCounts = new Map<string, { label: string; count: number }>();
  if (catalogOk) {
    for (const model of pool) {
      const slug = figureSlug(model);
      if (!slug || !model.figure) continue;
      const prev = figureCounts.get(slug);
      if (prev) prev.count += 1;
      else figureCounts.set(slug, { label: model.figure, count: 1 });
    }
    for (const [slug, { label, count }] of figureCounts) {
      if (count < menuMin) continue;
      figures.push({
        slug,
        label,
        href: figurePath(slug),
        count,
        icon: facetIcon("figure", slug),
      });
    }
    figures.sort((a, b) => b.count - a.count);
  }

  const countries: MenuFacetItem[] = [];
  if (catalogOk) {
    const counts = new Map<string, { label: string; count: number }>();
    for (const model of pool) {
      const label = countryLabel(model.countryCode, model.country);
      if (!label) continue;
      const slug = slugify(label);
      const prev = counts.get(slug);
      if (prev) prev.count += 1;
      else counts.set(slug, { label, count: 1 });
    }
    for (const [slug, { label, count }] of counts) {
      if (count < menuMin) continue;
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

  const languages: MenuFacetItem[] = [];
  if (catalogOk) {
    for (const { slug, label, count } of topLanguages(pool)) {
      if (count < menuMin) continue;
      languages.push({
        slug,
        label,
        href: languagePath(slug),
        count,
        icon: facetIcon("language", slug),
      });
    }
  }

  const segments: MenuFacetItem[] = catalogOk
    ? [
        {
          slug: "female",
          label: "Female",
          href: categoryPath("mature"),
          count: pool.length,
          icon: "♀",
        },
      ]
    : [];

  const headerChips: MenuFacetItem[] = [
    ...niches.slice(0, 2),
    ...countries.slice(0, 2),
    ...ageBands.slice(0, 2),
    ...ethnicities.slice(0, 1),
    ...hairs.slice(0, 1),
  ].slice(0, 8);

  return {
    catalogOk,
    catalogCount: pool.length,
    segments,
    niches,
    ageBands,
    ethnicities,
    hairs,
    busts,
    figures,
    countries,
    languages,
    headerChips,
    nicheCanonicalTo,
  };
}

export type CatalogSitemapBundle = {
  taxonomyContext: TaxonomyIndexabilityContext;
  combos: ComboLanding[];
  indexableBusts: Set<string>;
  indexableFigures: Set<string>;
  indexableCombos: Set<string>;
};

export function buildCatalogSitemapBundle(
  pool: CamModel[],
): CatalogSitemapBundle {
  const min = FACET_SITEMAP_MIN_COUNT;
  const menu = buildCatalogMenuInventory(pool, pool.length > 0);
  const combos = buildComboLandings(pool, min);

  const indexableBusts = new Set(
    menu.busts.filter((b) => b.count >= min).map((b) => b.slug),
  );
  const indexableFigures = new Set(
    menu.figures.filter((f) => f.count >= min).map((f) => f.slug),
  );

  return {
    taxonomyContext: {
      indexableCategories: new Set(menu.niches.map((n) => n.slug)),
      indexableTags: new Set(),
      indexableCountries: new Set(menu.countries.map((c) => c.slug)),
      indexableLanguages: new Set(menu.languages.map((l) => l.slug)),
      indexableAgeBands: new Set(menu.ageBands.map((a) => a.slug)),
      indexableEthnicities: new Set(menu.ethnicities.map((e) => e.slug)),
      indexableHairs: new Set(menu.hairs.map((h) => h.slug)),
    },
    combos,
    indexableBusts,
    indexableFigures,
    indexableCombos: new Set(combos.map((c) => c.slug)),
  };
}

export function getComboBySlug(
  pool: CamModel[],
  slug: string,
): ComboLanding | undefined {
  return buildComboLandings(pool, FACET_SITEMAP_MIN_COUNT).find(
    (c) => c.slug === slug,
  );
}
