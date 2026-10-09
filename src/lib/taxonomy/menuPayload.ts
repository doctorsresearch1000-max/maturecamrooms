import { getFullCatalog } from "@/lib/crak/fullCatalog";
import { buildCatalogMenuInventory } from "@/lib/taxonomy/catalogInventory";
import { fetchLiveMenuPool } from "@/lib/taxonomy/fetchLivePool";
import {
  CATEGORY_DISPLAY,
  NAV_SITE_CATEGORIES,
  type NavSiteCategory,
} from "@/lib/seo/config";
import { categoryPath } from "@/lib/seo/slug";
import type { CatalogMenuInventory } from "@/lib/taxonomy/catalogInventory";
import type { MenuFacetItem } from "@/lib/taxonomy/liveMenuInventory";

export type TaxonomyMenuLink = {
  slug: string;
  label: string;
  href: string;
  count?: number;
  icon?: string;
};

export type TaxonomyMenuPayload = {
  feedOk: boolean;
  liveCount: number | undefined;
  catalogOk: boolean;
  catalogCount: number;
  categories: TaxonomyMenuLink[];
  segments: TaxonomyMenuLink[];
  ageBands: TaxonomyMenuLink[];
  ethnicities: TaxonomyMenuLink[];
  hairs: TaxonomyMenuLink[];
  busts: TaxonomyMenuLink[];
  figures: TaxonomyMenuLink[];
  countries: TaxonomyMenuLink[];
  languages: TaxonomyMenuLink[];
  headerChips: TaxonomyMenuLink[];
  nicheCanonicalTo: Record<string, string>;
};

function staticCategoryFallback(): TaxonomyMenuLink[] {
  return NAV_SITE_CATEGORIES.map((slug: NavSiteCategory) => ({
    slug,
    label: CATEGORY_DISPLAY[slug],
    href: categoryPath(slug),
  }));
}

export async function getTaxonomyMenuPayload(): Promise<TaxonomyMenuPayload> {
  let inventory: CatalogMenuInventory = {
    catalogOk: false,
    catalogCount: 0,
    segments: [],
    niches: [],
    ageBands: [],
    ethnicities: [],
    hairs: [],
    busts: [],
    figures: [],
    countries: [],
    languages: [],
    headerChips: [],
    nicheCanonicalTo: {},
  };

  try {
    const snapshot = await getFullCatalog();
    inventory = buildCatalogMenuInventory(
      snapshot.models,
      snapshot.models.length > 0,
    );
  } catch {
    // catalog unavailable — static nav only
  }

  const catalogOk = inventory.catalogOk && inventory.catalogCount > 0;
  const { pool, feedOk: liveOk } = await fetchLiveMenuPool().catch(() => ({
    pool: [],
    feedOk: false,
  }));
  const liveCount =
    liveOk && pool.length > 0
      ? pool.filter((m) => m.isLive).length
      : undefined;

  const categories = catalogOk
    ? inventory.niches
    : staticCategoryFallback();

  return {
    feedOk: liveOk,
    liveCount,
    catalogOk,
    catalogCount: inventory.catalogCount,
    categories,
    segments: catalogOk ? inventory.segments : [],
    ageBands: catalogOk ? inventory.ageBands : [],
    ethnicities: catalogOk ? inventory.ethnicities : [],
    hairs: catalogOk ? inventory.hairs : [],
    busts: catalogOk ? inventory.busts : [],
    figures: catalogOk ? inventory.figures : [],
    countries: catalogOk ? inventory.countries : [],
    languages: catalogOk ? inventory.languages : [],
    headerChips: catalogOk ? inventory.headerChips : [],
    nicheCanonicalTo: inventory.nicheCanonicalTo,
  };
}
