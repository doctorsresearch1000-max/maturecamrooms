import { siteConfig } from "@/lib/site";
import { PLACEHOLDER_MODELS } from "@/lib/models/placeholders";
import type { CamModel } from "@/lib/models/types";

function catalogPool(): CamModel[] {
  const defaultTagSet = new Set(siteConfig.defaultTags);
  const filtered = PLACEHOLDER_MODELS.filter((model) =>
    model.tags.some((tag) => defaultTagSet.has(tag.toLowerCase())),
  );
  return filtered.length > 0 ? filtered : PLACEHOLDER_MODELS;
}

/**
 * Server-side model feed. Swap implementation for Crak / Stripchat / Chaturbate APIs.
 */
export async function getFeaturedModels(limit = 24): Promise<CamModel[]> {
  return catalogPool().slice(0, limit);
}

export async function getAllModels(): Promise<CamModel[]> {
  return catalogPool();
}

export async function getModelByUsername(
  username: string,
): Promise<CamModel | undefined> {
  const slug = username.toLowerCase();
  return catalogPool().find((m) => m.username.toLowerCase() === slug);
}

export async function getRelatedModels(
  model: CamModel,
  limit = 8,
): Promise<CamModel[]> {
  const tagSet = new Set(model.tags.map((t) => t.toLowerCase()));
  return catalogPool()
    .filter((m) => m.id !== model.id)
    .map((m) => ({
      model: m,
      score: m.tags.filter((t) => tagSet.has(t.toLowerCase())).length,
    }))
    .sort((a, b) => b.score - a.score || b.model.viewers - a.model.viewers)
    .slice(0, limit)
    .map((x) => x.model);
}
