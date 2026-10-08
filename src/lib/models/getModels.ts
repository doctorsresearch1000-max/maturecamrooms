import { siteConfig } from "@/lib/site";
import { PLACEHOLDER_MODELS } from "@/lib/models/placeholders";
import type { CamModel } from "@/lib/models/types";

/**
 * Server-side model feed. Swap implementation for Crak / Stripchat / Chaturbate APIs.
 */
export async function getFeaturedModels(limit = 24): Promise<CamModel[]> {
  const defaultTagSet = new Set(siteConfig.defaultTags);

  const filtered = PLACEHOLDER_MODELS.filter((model) =>
    model.tags.some((tag) => defaultTagSet.has(tag.toLowerCase())),
  );

  const pool = filtered.length > 0 ? filtered : PLACEHOLDER_MODELS;
  return pool.slice(0, limit);
}
