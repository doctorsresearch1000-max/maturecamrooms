export type ProfileCtaVariantId = "a" | "b";

export const LIVE_PROFILE_CTA_VARIANTS: ReadonlyArray<{
  id: ProfileCtaVariantId;
  label: (displayName: string) => string;
}> = [
  {
    id: "a",
    label: (name) => `Watch ${name} live now`,
  },
  {
    id: "b",
    label: (name) => `Join ${name}'s live room`,
  },
];

export const SSR_LIVE_PROFILE_CTA_VARIANT_ID: ProfileCtaVariantId = "a";

export function offlineProfileCtaLabel(displayName: string): string {
  return `See ${displayName}'s profile and schedule`;
}

export function liveProfileCtaLabel(
  displayName: string,
  variantId: ProfileCtaVariantId,
): string {
  const variant =
    LIVE_PROFILE_CTA_VARIANTS.find((v) => v.id === variantId) ??
    LIVE_PROFILE_CTA_VARIANTS[0];
  return variant.label(displayName);
}
