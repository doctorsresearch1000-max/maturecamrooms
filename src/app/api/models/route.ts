import { getModelsPage, searchModels } from "@/lib/models/getModels";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const limit = Math.min(
    48,
    Math.max(1, Number(searchParams.get("limit") ?? "24") || 24),
  );
  const liveParam = searchParams.get("live");
  const live =
    liveParam === "false" ? false : liveParam === "all" ? undefined : true;

  const result = q
    ? await searchModels(q)
    : await getModelsPage(page, limit, { live });

  return Response.json(result, {
    status: result.source === "error" ? 503 : 200,
  });
}
