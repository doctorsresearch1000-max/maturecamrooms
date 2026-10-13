import { movedPermanently } from "@/lib/http/movedPermanently";
import { resolvePlayerRouteSlug } from "@/lib/profile/resolvePlayerRouteSlug";
import { canonicalModelUrl } from "@/lib/seo/canonical";
import { modelPermalinkPath } from "@/lib/seo/modelPermalink";

export async function legacyPlayerRouteRedirect(
  rawId: string,
): Promise<Response> {
  const slug = await resolvePlayerRouteSlug(rawId);
  if (!slug) {
    return new Response("Not Found", {
      status: 404,
      headers: { "X-Robots-Tag": "noindex, nofollow" },
    });
  }

  const path = modelPermalinkPath(slug);
  const canonical = canonicalModelUrl(slug);
  return movedPermanently(path, {
    "X-Robots-Tag": "noindex, follow",
    Link: `<${canonical}>; rel="canonical"`,
  });
}
