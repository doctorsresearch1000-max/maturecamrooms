import { getFullCatalog } from "@/lib/crak/fullCatalog";
import { getModelByUsername } from "@/lib/models/getModels";
import { sanitizeModelSlug } from "@/lib/seo/modelPermalink";

/**
 * Maps `/live/[id]` and `/watch/[id]` to a canonical `/model/{slug}`.
 */
export async function resolvePlayerRouteSlug(
  rawId: string,
): Promise<string | null> {
  const decoded = decodeURIComponent(rawId).trim();
  if (!decoded) return null;

  const asSlug = sanitizeModelSlug(decoded);
  if (asSlug) {
    const model = await getModelByUsername(asSlug);
    if (model) {
      return sanitizeModelSlug(model.username) ?? asSlug;
    }
  }

  const needle = decoded.toLowerCase();
  const catalog = await getFullCatalog();
  const byItemId = catalog.models.find(
    (m) => m.itemId?.toLowerCase() === needle,
  );
  if (byItemId) {
    return sanitizeModelSlug(byItemId.username);
  }

  const byUsername = catalog.models.find(
    (m) => sanitizeModelSlug(m.username) === asSlug,
  );
  if (byUsername) {
    return sanitizeModelSlug(byUsername.username);
  }

  return null;
}
