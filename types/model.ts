export interface Model {
  id: string;
  username: string;
  displayName: string;
  age?: number;
  country?: string;
  countryCode?: string;
  categories: string[];
  thumbnail: string;
  previewUrl?: string;
  isLive: boolean;
  viewerCount?: number;
  destinationUrl: string;
  updatedAt?: string;
}
export type CategoryFilter = 'all' | 'live' | 'mature' | 'milf' | 'popular' | 'new';
