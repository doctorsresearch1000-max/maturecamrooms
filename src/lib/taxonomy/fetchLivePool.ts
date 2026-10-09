import { getModelsPage } from "@/lib/models/getModels";
import type { CamModel } from "@/lib/models/types";

const MENU_SAMPLE_PAGES = 6;
const PAGE_SIZE = 48;

export async function fetchLiveMenuPool(): Promise<{
  pool: CamModel[];
  feedOk: boolean;
}> {
  const pageResults = await Promise.all(
    Array.from({ length: MENU_SAMPLE_PAGES }, (_, i) =>
      getModelsPage(i + 1, PAGE_SIZE, { live: true, sorting: "score" }),
    ),
  );

  const feedOk =
    pageResults.some((p) => p.source === "crak") &&
    !pageResults.some((p) => p.source === "error" || p.source === "unconfigured");
  const pool = pageResults.flatMap((p) => p.models);
  const byId = new Map<string, CamModel>();
  for (const m of pool) byId.set(m.id, m);

  return { pool: [...byId.values()], feedOk };
}
