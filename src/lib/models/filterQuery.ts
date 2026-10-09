import type { ModelQuery } from "@/lib/models/getModels";

export type DiscoveryFilterId =
  | "live"
  | "all"
  | "mature"
  | "milf"
  | "cougar"
  | "popular"
  | "new";

export function discoveryFilterToQuery(
  filter: DiscoveryFilterId | string,
): ModelQuery {
  switch (filter) {
    case "live":
      return { live: true, sorting: "score" };
    case "all":
      return { live: undefined, sorting: "score" };
    case "mature":
      return { live: true, tag: "mature", sorting: "score" };
    case "milf":
      return { live: true, tag: "milf", sorting: "score" };
    case "cougar":
      return { live: true, tag: "cougar", sorting: "score" };
    case "popular":
      return { live: true, sorting: "score" };
    case "new":
      return { live: true, sorting: "mostRecent" };
    default:
      return { live: true, sorting: "score" };
  }
}
