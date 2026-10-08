import type { CamModel } from "@/lib/models/types";

export function rankRelatedModels(
  current: CamModel,
  pool: CamModel[],
  limit = 8,
): CamModel[] {
  const currentTags = new Set(current.tags.map((t) => t.toLowerCase()));
  const currentCat = current.primaryCategory?.toLowerCase();

  const scored = pool
    .filter((m) => m.id !== current.id && m.username !== current.username)
    .map((m) => {
      let score = 0;
      if (currentCat && m.tags.some((t) => t.toLowerCase() === currentCat)) {
        score += 5;
      }
      for (const tag of m.tags) {
        if (currentTags.has(tag.toLowerCase())) score += 3;
      }
      if (
        current.countryCode &&
        m.countryCode &&
        current.countryCode === m.countryCode
      ) {
        score += 2;
      }
      if (current.platform === m.platform) score += 1;
      if (m.isLive) score += 3;
      if (m.score) score += Math.min(m.score, 5) * 0.2;
      return { m, score };
    })
    .sort((a, b) => b.score - a.score || (b.m.viewers ?? 0) - (a.m.viewers ?? 0));

  const seen = new Set<string>();
  const out: CamModel[] = [];
  for (const { m } of scored) {
    if (seen.has(m.id)) continue;
    seen.add(m.id);
    out.push(m);
    if (out.length >= limit) break;
  }
  return out;
}
