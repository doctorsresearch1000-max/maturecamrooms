import type { CrakPerformer } from "@/lib/crak/types";

export type MatureCategory = "mature" | "milf" | "cougar" | "mom";

/** Primary niche when multiple apply (most specific first). */
const PRIMARY_NICHE_ORDER: MatureCategory[] = [
  "mom",
  "cougar",
  "milf",
  "mature",
];

function tagBlob(performer: CrakPerformer): string[] {
  return [
    ...(performer.characteristicsTags ?? []),
    ...(performer.autoTags ?? []),
    ...(performer.customTags ?? []),
  ]
    .map((t) => t.toLowerCase().trim())
    .filter(Boolean);
}

function hasTag(tags: string[], needles: string[]): boolean {
  return tags.some((tag) => needles.some((n) => tag.includes(n)));
}

export function mapPerformerTaxonomy(performer: CrakPerformer): {
  categories: MatureCategory[];
  tags: string[];
} {
  const unique = [...new Set(tagBlob(performer))];
  const categories = new Set<MatureCategory>();
  const age = performer.characteristic?.age;

  if (typeof age === "number" && age >= 40) {
    categories.add("mature");
  }
  if (
    hasTag(unique, ["mature", "gc_40", "gc_50", "50_plus", "granny"]) &&
    (typeof age !== "number" || age >= 40)
  ) {
    categories.add("mature");
  }

  if (
    hasTag(unique, ["milf", "housewife"]) ||
    (typeof age === "number" && age >= 30 && age <= 45)
  ) {
    categories.add("milf");
  }

  if (hasTag(unique, ["cougar"])) {
    categories.add("cougar");
  }

  if (hasTag(unique, ["mom", "mommy", "mama"])) {
    categories.add("mom");
  }

  if (categories.size === 0) {
    if (typeof age === "number" && age >= 30) categories.add("milf");
    else categories.add("mature");
  }

  const ordered = PRIMARY_NICHE_ORDER.filter((c) => categories.has(c));
  const displayTags = unique
    .filter((t) => !t.startsWith("lang") && !t.startsWith("gc_"))
    .slice(0, 12);

  return {
    categories: ordered.length > 0 ? ordered : ["mature"],
    tags: displayTags.length > 0 ? displayTags : ordered,
  };
}

export function primaryNicheCategory(
  categories: MatureCategory[],
): MatureCategory {
  for (const niche of PRIMARY_NICHE_ORDER) {
    if (categories.includes(niche)) return niche;
  }
  return categories[0] ?? "mature";
}

export function matureTagsQuery(): string {
  return "milf,mature,housewife";
}

/** Legacy live-feed narrow ages (runtime discovery only). */
export function matureAgeGroupsQuery(): string {
  return "gc_40_49,gc_50_plus";
}

/** Full catalog age bands for widened offline inventory. */
export function catalogAgeGroupsQuery(): string {
  return "gc_30_39,gc_40_49,gc_50_59,gc_60_plus";
}
