import { getAllModels } from "@/lib/models/getModels";

export const runtime = "edge";

export async function GET() {
  const models = await getAllModels();
  return Response.json(models);
}
