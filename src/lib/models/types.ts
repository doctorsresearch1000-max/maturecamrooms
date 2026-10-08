import type { AffiliatePlatform } from "@/lib/affiliate/links";

export type CamModel = {
  id: string;
  itemId?: string;
  username: string;
  displayName: string;
  age?: number;
  tags: string[];
  viewers?: number;
  isLive: boolean;
  thumbnailUrl: string;
  previewEmbedUrl?: string;
  iframeFeedUrl?: string;
  streamFeedUrl?: string;
  roomUrl?: string;
  platform: AffiliatePlatform;
  countryCode?: string;
  country?: string;
  hair?: string;
  figure?: string;
  description?: string;
  languages?: string[];
  expertise?: string;
  turnOns?: string;
  lastConnection?: string;
  primaryCategory?: string;
  score?: number;
  stars?: number;
  recentlyOnline?: boolean;
};

/** Normalized performer record (Phase 2) — source of truth for UI + SEO. */
export type NormalizedModel = CamModel;

export type ModelsResult = {
  models: CamModel[];
  source: "crak" | "unconfigured" | "error";
  message?: string;
  broadened?: boolean;
};
