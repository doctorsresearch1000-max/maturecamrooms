import { getModelsPage } from "@/lib/models/getModels";
import {
  CATEGORY_DISPLAY,
  SITE_CATEGORIES,
  type SiteCategory,
} from "@/lib/seo/config";
import { filterModelsByCategory } from "@/lib/seo/filters";
import { countryLabel } from "@/lib/country";
import { slugify, categoryPath, countryPath } from "@/lib/seo/slug";
import type { CamModel } from "@/lib/models/types";

export const runtime = "edge";

const MENU_SAMPLE_PAGES = 6;
const PAGE_SIZE = 48;

function topCountries(pool: CamModel[], limit = 10) {
  const counts = new Map<string, { label: string; count: number }>();
  for (const model of pool) {
    const label = countryLabel(model.countryCode, model.country);
    if (!label) continue;
    const slug = slugify(label);
    const prev = counts.get(slug);
    if (prev) prev.count += 1;
    else counts.set(slug, { label, count: 1 });
  }
  return [...counts.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([slug, { label, count }]) => ({
      slug,
      label,
      href: countryPath(slug),
      count,
    }));
}

export async function GET() {
  const pageResults = await Promise.all(
    Array.from({ length: MENU_SAMPLE_PAGES }, (_, i) =>
      getModelsPage(i + 1, PAGE_SIZE, { live: true, sorting: "score" }),
    ),
  );

  const pool = pageResults.flatMap((p) => p.models);
  const liveCount = pool.filter((m) => m.isLive).length;

  const categoryCounts: Record<string, number> = {};
  for (const cat of SITE_CATEGORIES) {
    categoryCounts[cat] = filterModelsByCategory(pool, cat).length;
  }

  const categories = SITE_CATEGORIES.map((slug: SiteCategory) => ({
    slug,
    label: CATEGORY_DISPLAY[slug],
    href: categoryPath(slug),
    count: categoryCounts[slug] ?? 0,
  }));

  const countries = topCountries(pool);

  return Response.json({
    liveCount,
    sampled: pool.length,
    categories,
    categoryCounts,
    countries,
  });
}
