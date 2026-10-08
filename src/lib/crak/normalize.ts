import { pickSafeStreamUrl } from "@/lib/crak/allowlist";
import { mapPerformerTaxonomy } from "@/lib/crak/taxonomy";
import type { CrakPerformer } from "@/lib/crak/types";
import type { CamModel } from "@/lib/models/types";
import type { AffiliatePlatform } from "@/lib/affiliate/links";

function mapPlatform(source?: string): AffiliatePlatform {
  const s = (source ?? "").toLowerCase();
  if (s.includes("stripchat")) return "stripchat";
  if (s.includes("chaturbate")) return "chaturbate";
  return "crak";
}

function countryCodeFromCharacteristic(country?: string): string | undefined {
  if (!country) return undefined;
  if (country.length === 2) return country.toUpperCase();
  return undefined;
}

export function normalizePerformer(performer: CrakPerformer): CamModel {
  const { categories, tags } = mapPerformerTaxonomy(performer);
  const slug = performer.nameClean || performer.name;
  const iframeFeedUrl = pickSafeStreamUrl(
    performer.iframeFeedURL,
    performer.streamFeedUrl,
  );

  const age = performer.characteristic?.age;
  const countryName =
    typeof performer.i18n?.characteristic === "object" &&
    performer.i18n.characteristic &&
    "country" in performer.i18n.characteristic
      ? String(
          (performer.i18n.characteristic as { country?: string }).country ??
            "",
        )
      : performer.characteristic?.country;

  return {
    id: performer.itemId || slug,
    username: slug,
    displayName: performer.name || slug,
    age: typeof age === "number" && age > 0 ? age : undefined,
    tags: [...new Set([...categories, ...tags])],
    viewers: undefined,
    isLive: Boolean(performer.live),
    thumbnailUrl: performer.thumbnailUrl ?? "",
    iframeFeedUrl,
    streamFeedUrl: performer.streamFeedUrl,
    previewEmbedUrl: iframeFeedUrl,
    platform: mapPlatform(performer.systemSource),
    countryCode: countryCodeFromCharacteristic(performer.characteristic?.country),
    country: countryName && countryName.length > 2 ? countryName : undefined,
    hair: performer.characteristic?.hairColor,
    figure: performer.characteristic?.bodyTypes?.[0],
    ethnicity: performer.characteristic?.ethnicities?.[0],
    bustSize: performer.characteristic?.bustSize,
    height: performer.characteristic?.height,
    description: performer.i18n?.description,
    languages: performer.characteristic?.languages,
    expertise: performer.i18n?.expertise,
    turnOns: performer.i18n?.turnOns,
    recentlyOnline: !performer.live && Boolean(performer.lastConnection),
    lastConnection: performer.lastConnection,
    roomUrl: performer.roomUrl,
    score: performer.score ?? performer.systemScore,
    stars: performer.stars,
    primaryCategory: categories[0],
    itemId: performer.itemId,
  };
}
