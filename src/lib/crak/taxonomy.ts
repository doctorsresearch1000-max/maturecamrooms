import type { CrakPerformer } from "@/lib/crak/types";

export type MatureCategory = "mature" | "milf" | "cougar" | "mom";

const CATEGORY_PRIORITY: MatureCategory[] = [
  "mature",
  "milf",
  "cougar",
  "mom",
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

  if (hasTag(unique, ["milf"])) categories.add("milf");
  if (hasTag(unique, ["housewife"]) && !hasTag(unique, ["milf"])) {
    categories.add("milf");
  }
  if (hasTag(unique, ["cougar"])) categories.add("cougar");
  if (hasTag(unique, ["mom", "mommy", "mama"])) categories.add("mom");
  if (
    hasTag(unique, ["mature", "gc_40", "gc_50", "50_plus", "granny"]) ||
    (typeof age === "number" && age >= 50)
  ) {
    categories.add("mature");
  } else if (typeof age === "number" && age >= 40) {
    categories.add("mature");
  }

  if (categories.size === 0) {
    if (typeof age === "number" && age >= 35) categories.add("milf");
    else categories.add("mature");
  }

  const ordered = CATEGORY_PRIORITY.filter((c) => categories.has(c));
  const displayTags = unique
    .filter((t) => !t.startsWith("lang") && !t.startsWith("gc_"))
    .slice(0, 12);

  return {
    categories: ordered.length > 0 ? ordered : ["mature"],
    tags: displayTags.length > 0 ? displayTags : ordered,
  };
}

export function matureTagsQuery(): string {
  return "milf,mature,housewife";
}

export function matureAgeGroupsQuery(): string {
  return "gc_40_49,gc_50_plus";
}
