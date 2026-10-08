import { siteConfig } from "@/lib/site";

export const AFFILIATE_REL = "nofollow sponsored";

export type AffiliatePlatform = "crak" | "stripchat" | "chaturbate" | "generic";

function stripchatRoomUrl(username: string, affiliateId: string): string {
  const slug = encodeURIComponent(username);
  if (!affiliateId) {
    return `https://stripchat.com/${slug}`;
  }
  return `https://stripchat.com/${slug}?userId=${encodeURIComponent(affiliateId)}`;
}

function chaturbateRoomUrl(username: string, affiliateId: string): string {
  const slug = encodeURIComponent(username);
  if (!affiliateId) {
    return `https://chaturbate.com/${slug}/`;
  }
  return `https://chaturbate.com/in/?tour=grq0&campaign=${encodeURIComponent(affiliateId)}&track=default&room=${slug}`;
}

export function buildAffiliateRoomUrl(
  platform: AffiliatePlatform,
  username: string,
): string {
  const crak = process.env.NEXT_PUBLIC_CRAK_SMARTLINK?.trim();
  const stripchatId = process.env.NEXT_PUBLIC_STRIPCHAT_AFFILIATE_ID?.trim() ?? "";
  const chaturbateId =
    process.env.NEXT_PUBLIC_CHATURBATE_AFFILIATE_ID?.trim() ?? "";

  switch (platform) {
    case "crak":
      if (crak) {
        const joiner = crak.includes("?") ? "&" : "?";
        return `${crak}${joiner}model=${encodeURIComponent(username)}`;
      }
      return absoluteRoomFallback(username);
    case "stripchat":
      return stripchatRoomUrl(username, stripchatId);
    case "chaturbate":
      return chaturbateRoomUrl(username, chaturbateId);
    default:
      return absoluteRoomFallback(username);
  }
}

function absoluteRoomFallback(username: string): string {
  return `${siteConfig.url}/go/${encodeURIComponent(username)}`;
}

export function affiliateLinkProps(targetBlank = true) {
  return {
    rel: targetBlank ? `${AFFILIATE_REL} noreferrer` : AFFILIATE_REL,
    ...(targetBlank ? { target: "_blank" as const } : {}),
  };
}
