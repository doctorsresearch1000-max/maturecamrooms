export interface Model {
  id: string;
  name: string;
  age: number;
  rating: number;
  viewers: number;
  tags: string[];
  thumbnailUrl: string;
  streamUrl?: string;
  isOnline: boolean;
  isHD: boolean;
  country: string;
}
