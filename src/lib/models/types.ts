import type { AffiliatePlatform } from "@/lib/affiliate/links";

export type CamModel = {
  id: string;
  username: string;
  displayName: string;
  age: number;
  tags: string[];
  viewers: number;
  isLive: boolean;
  thumbnailUrl: string;
  previewEmbedUrl?: string;
  platform: AffiliatePlatform;
  countryCode?: string;
  country?: string;
  hair?: string;
  figure?: string;
  description?: string;
  languages?: string[];
  /** When offline, optional hint for UI */
  recentlyOnline?: boolean;
};
