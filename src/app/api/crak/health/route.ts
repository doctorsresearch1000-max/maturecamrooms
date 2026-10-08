import { fetchPerformers } from "@/lib/crak/client";
import { isCrakConfigured } from "@/lib/crak/config";
import { getCrakRuntimeDiagnostics } from "@/lib/crak/diagnostics";
import { normalizePerformer } from "@/lib/crak/normalize";
import { matureTagsQuery } from "@/lib/crak/taxonomy";

export const runtime = "edge";

/**
 * Diagnostic endpoint — never returns secret values, only presence/length.
 */
export async function GET() {
  const diagnostics = getCrakRuntimeDiagnostics();

  if (!isCrakConfigured()) {
    return Response.json(
      {
        ok: false,
        configured: false,
        message: "CRAK_API_KEY and CRAK_TOKEN are required",
        diagnostics,
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
      diagnostics,
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
    const message = err instanceof Error ? err.message : "Health check failed";
    const detail =
      err && typeof err === "object" && "detail" in err
        ? String((err as { detail?: string }).detail)
        : undefined;

    console.error("[crak] health check failed", { message, detail });

    return Response.json(
      {
        ok: false,
        configured: true,
        message,
        detail,
        diagnostics,
      },
      { status: err && typeof err === "object" && "status" in err
          ? Number((err as { status: number }).status) || 502
          : 502 },
    );
  }
}
