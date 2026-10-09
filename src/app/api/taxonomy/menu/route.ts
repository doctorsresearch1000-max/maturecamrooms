import { getCatalogMenuSnapshot } from "@/lib/catalog/staticCatalog";
import { fetchLiveOverlay } from "@/lib/crak/liveOverlay";
import {
  CATEGORY_DISPLAY,
  SITE_CATEGORIES,
  type SiteCategory,
} from "@/lib/seo/config";
import { categoryPath } from "@/lib/seo/slug";

export const runtime = "edge";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  try {
    const snapshot = await getCatalogMenuSnapshot(origin);
    const { feedOk, liveModels } = await fetchLiveOverlay();
    const liveCount = feedOk ? liveModels.length : undefined;

    const catalogOk = snapshot.catalogCount > 0;
    const inventory = snapshot.menu;

    const categories = catalogOk
      ? inventory.niches
      : SITE_CATEGORIES.map((slug: SiteCategory) => ({
          slug,
          label: CATEGORY_DISPLAY[slug],
          href: categoryPath(slug),
          count: undefined as number | undefined,
        }));

    return Response.json({
      feedOk,
      liveCount,
      catalogOk,
      catalogCount: snapshot.catalogCount,
      categories,
      categoryCounts: Object.fromEntries(
        inventory.niches.map((n) => [n.slug, n.count]),
      ),
      niches: inventory.niches,
      segments: inventory.segments,
      ageBands: inventory.ageBands,
      ethnicities: inventory.ethnicities,
      hairs: inventory.hairs,
      busts: inventory.busts,
      figures: inventory.figures,
      countries: inventory.countries,
      languages: inventory.languages,
      headerChips: catalogOk ? inventory.headerChips : [],
      nicheCanonicalTo: inventory.nicheCanonicalTo,
    });
  } catch {
    return Response.json({
      feedOk: false,
      liveCount: undefined,
      catalogOk: false,
      categories: SITE_CATEGORIES.map((slug: SiteCategory) => ({
        slug,
        label: CATEGORY_DISPLAY[slug],
        href: categoryPath(slug),
      })),
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
    });
  }
}
