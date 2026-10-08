import { getAllModels, searchModels } from "@/lib/models/getModels";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  const result = q ? await searchModels(q) : await getAllModels();

  return Response.json(result, {
    status: result.source === "error" ? 503 : 200,
  });
}
