import { getModelsPage } from "@/lib/models/getModels";
import {
  CATEGORY_DISPLAY,
  SITE_CATEGORIES,
  type SiteCategory,
} from "@/lib/seo/config";
import { filterModelsByCategory } from "@/lib/seo/filters";
import { categoryPath } from "@/lib/seo/slug";

export const runtime = "edge";

export async function GET() {
  const pages = await Promise.all([
    getModelsPage(1, 48, { live: true }),
    getModelsPage(2, 48, { live: true }),
  ]);

  const pool = pages.flatMap((p) => p.models);
  const categories = SITE_CATEGORIES.map((slug: SiteCategory) => {
    const count = filterModelsByCategory(pool, slug).length;
    return {
      slug,
      label: CATEGORY_DISPLAY[slug],
      href: categoryPath(slug),
      count,
    };
  }).filter((c) => c.count > 0);

  return Response.json({ categories, sampled: pool.length });
}
