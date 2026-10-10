import type { AffiliatePlatform } from "@/lib/affiliate/links";
import { siteConfig } from "@/lib/site";

/** CrakRevenue tracking sub-id for maturecamrooms.com (all outbound CRAK clicks). */
export const CRAK_SUBID_PARAM = "subid";
export const CRAK_SUBID_DEFAULT = "maturecamrooms_com";

const CRAK_AFFILIATE_HOST_SUFFIXES = [
  "streamate.com",
  "streamatemodels.com",
  "crakrevenue.com",
  "crackrevenue.com",
  "wmcdct.com",
  "wmcdp.com",
] as const;

/** Hosts used for embeds/thumbnails — not monetized click-out URLs. */
const NON_AFFILIATE_HOST_SUFFIXES = [
  "naiadsystems.com",
  "pcvdaa.com",
  "unsplash.com",
] as const;

function readConfiguredSubId(): string {
  const fromEnv = process.env.NEXT_PUBLIC_CRAK_SUBID?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : CRAK_SUBID_DEFAULT;
}

function hostnameOf(url: string): string | undefined {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return undefined;
  }
}

function hostMatchesSuffix(hostname: string, suffix: string): boolean {
  return hostname === suffix || hostname.endsWith(`.${suffix}`);
}

export function isInternalSiteUrl(url: string): boolean {
  const host = hostnameOf(url);
  if (!host) return false;
  try {
    const siteHost = new URL(siteConfig.url).hostname.toLowerCase();
    if (host === siteHost || host.endsWith(`.${siteHost}`)) return true;
  } catch {
    /* ignore */
  }
  return host === "localhost" || host.endsWith(".localhost");
}

export function isNonAffiliateMediaHost(url: string): boolean {
  const host = hostnameOf(url);
  if (!host) return false;
  return NON_AFFILIATE_HOST_SUFFIXES.some((s) => hostMatchesSuffix(host, s));
}

export function isCrakRevenueAffiliateHost(url: string): boolean {
  const host = hostnameOf(url);
  if (!host) return false;
  return CRAK_AFFILIATE_HOST_SUFFIXES.some((s) => hostMatchesSuffix(host, s));
}

/**
 * True when this HTTPS URL should receive `subid=` (CrakRevenue outbound).
 */
export function shouldAttachCrakSubId(
  url: string,
  platform?: AffiliatePlatform,
): boolean {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return false;
  }
  if (isInternalSiteUrl(url) || isNonAffiliateMediaHost(url)) {
    return false;
  }
  if (platform === "stripchat" || platform === "chaturbate") {
    return false;
  }
  if (platform === "crak") {
    return true;
  }
  return isCrakRevenueAffiliateHost(url);
}

/**
 * Append or replace `subid` on a CrakRevenue affiliate URL without changing path/host.
 */
export function withCrakSubId(
  url: string,
  subId: string = readConfiguredSubId(),
): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set(CRAK_SUBID_PARAM, subId);
    return parsed.toString();
  } catch {
    return url;
  }
}

export function applyCrakTrackingSubId(
  url: string,
  options: { platform?: AffiliatePlatform } = {},
): string {
  if (!shouldAttachCrakSubId(url, options.platform)) {
    return url;
  }
  return withCrakSubId(url);
}
