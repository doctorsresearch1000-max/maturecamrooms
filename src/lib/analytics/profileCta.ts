export type ProfileCtaClickPayload = {
  position: "hero" | "after-profile" | "sticky";
  variant: string;
  model: string;
  isLive: boolean;
};

/**
 * Single hook point for profile CTA click analytics (GTM, Plausible, etc.).
 * No-op until wired; callers should set data-* on the anchor for DOM-based tools.
 */
export function trackProfileCtaClick(payload: ProfileCtaClickPayload): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent("mcr:profile-cta-click", { detail: payload }),
    );
  } catch {
    /* ignore */
  }
}
