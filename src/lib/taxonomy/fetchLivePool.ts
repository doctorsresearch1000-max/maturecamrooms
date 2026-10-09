import { fetchLiveOverlay } from "@/lib/crak/liveOverlay";
import type { CamModel } from "@/lib/models/types";

export async function fetchLiveMenuPool(): Promise<{
  pool: CamModel[];
  feedOk: boolean;
}> {
  const { liveModels, feedOk } = await fetchLiveOverlay();
  return {
    pool: liveModels,
    feedOk,
  };
}
