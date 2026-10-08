import { isCrakConfigured } from "@/lib/crak/config";
import { fetchPerformers } from "@/lib/crak/client";
import { normalizePerformer } from "@/lib/crak/normalize";
import { matureTagsQuery } from "@/lib/crak/taxonomy";

export const runtime = "edge";

/**
 * Development/diagnostic endpoint — does not expose credentials.
 */
export async function GET() {
  if (!isCrakConfigured()) {
    return Response.json(
      {
        ok: false,
        configured: false,
        message: "CRAK_API_KEY and CRAK_TOKEN are required",
      },
      { status: 503 },
    );
  }

  try {
    const res = await fetchPerformers({
      size: 3,
      page: 1,
      live: true,
      tags: matureTagsQuery(),
      sorting: "score",
      gender: "f",
    });
    const sample = res.performers[0];
    const normalized = sample ? normalizePerformer(sample) : null;

    return Response.json({
      ok: true,
      configured: true,
      count: res.count,
      sample: normalized
        ? {
            slug: normalized.username,
            live: normalized.isLive,
            hasThumbnail: Boolean(normalized.thumbnailUrl),
            hasIframe: Boolean(normalized.iframeFeedUrl),
            hasRoomUrl: Boolean(normalized.roomUrl),
          }
        : null,
    });
  } catch (err) {
    return Response.json(
      {
        ok: false,
        configured: true,
        message: err instanceof Error ? err.message : "Health check failed",
      },
      { status: 502 },
    );
  }
}
