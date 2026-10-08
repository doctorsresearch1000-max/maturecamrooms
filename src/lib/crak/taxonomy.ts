import type { CrakPerformer } from "@/lib/crak/types";

export type MatureCategory = "mature" | "milf" | "cougar" | "mom";

const MILF_SIGNALS = ["milf", "housewife"];
const COUGAR_SIGNALS = ["cougar", "mature"];
const MOM_SIGNALS = ["mom", "housewife"];

export function mapPerformerTaxonomy(performer: CrakPerformer): {
  categories: MatureCategory[];
  tags: string[];
} {
  const raw = [
    ...(performer.characteristicsTags ?? []),
    ...(performer.autoTags ?? []),
    ...(performer.customTags ?? []),
  ]
    .map((t) => t.toLowerCase().trim())
    .filter(Boolean);

  const unique = [...new Set(raw)];
  const categories = new Set<MatureCategory>();

  const age = performer.characteristic?.age;
  if (age !== undefined && age >= 40) categories.add("mature");
  if (age !== undefined && age >= 35 && age < 50) categories.add("milf");

  for (const tag of unique) {
    if (MILF_SIGNALS.some((s) => tag.includes(s))) categories.add("milf");
    if (COUGAR_SIGNALS.some((s) => tag.includes(s))) categories.add("cougar");
    if (MOM_SIGNALS.some((s) => tag.includes(s))) categories.add("mom");
    if (tag.includes("mature") || tag.includes("gc_40") || tag.includes("gc_50")) {
      categories.add("mature");
    }
  }

  if (categories.size === 0) categories.add("mature");

  const displayTags = unique
    .filter((t) => !t.startsWith("lang") && !t.startsWith("gc_"))
    .slice(0, 12);

  return {
    categories: [...categories],
    tags: displayTags.length > 0 ? displayTags : [...categories],
  };
}

export function matureTagsQuery(): string {
  return "milf,mature,housewife";
}

export function matureAgeGroupsQuery(): string {
  return "gc_40_49,gc_50_plus";
}
