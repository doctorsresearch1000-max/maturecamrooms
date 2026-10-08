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
};
