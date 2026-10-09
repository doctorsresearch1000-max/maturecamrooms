import type { CatalogCard } from "@/lib/catalog/types";
import type { CamModel } from "@/lib/models/types";

export function cardToCamModel(card: CatalogCard): CamModel {
  return {
    id: card.id,
    username: card.username,
    displayName: card.displayName,
    thumbnailUrl: card.thumbnailUrl,
    isLive: card.isLive,
    tags: card.primaryCategory ? [card.primaryCategory] : [],
    primaryCategory: card.primaryCategory,
    age: card.age,
    score: card.score,
    catalogBrand: card.catalogBrand,
    platform: (card.platform as CamModel["platform"]) ?? "crak",
  };
}
