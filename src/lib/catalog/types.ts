/** Minimal performer fields for grids / browse (static snapshot). */
export type CatalogCard = {
  id: string;
  username: string;
  displayName: string;
  thumbnailUrl: string;
  isLive: boolean;
  primaryCategory?: string;
  age?: number;
  score?: number;
  catalogBrand?: string;
  platform?: string;
};

export type CatalogFacetManifest = {
  count: number;
  pages: number;
};

export type CatalogManifest = {
  generatedAt: string;
  total: number;
  pageSize: number;
  allPages: number;
  categories: Record<string, CatalogFacetManifest>;
  ages: Record<string, CatalogFacetManifest>;
  ethnicities: Record<string, CatalogFacetManifest>;
  hairs: Record<string, CatalogFacetManifest>;
  busts: Record<string, CatalogFacetManifest>;
  figures: Record<string, CatalogFacetManifest>;
  countries: Record<string, CatalogFacetManifest>;
  languages: Record<string, CatalogFacetManifest>;
  combos: Record<string, CatalogFacetManifest>;
};

export type CatalogMenuSnapshot = {
  generatedAt: string;
  catalogCount: number;
  menu: {
    niches: { slug: string; label: string; href: string; count: number; icon?: string }[];
    ageBands: { slug: string; label: string; href: string; count: number; icon?: string }[];
    ethnicities: { slug: string; label: string; href: string; count: number; icon?: string }[];
    hairs: { slug: string; label: string; href: string; count: number; icon?: string }[];
    busts: { slug: string; label: string; href: string; count: number; icon?: string }[];
    figures: { slug: string; label: string; href: string; count: number; icon?: string }[];
    countries: { slug: string; label: string; href: string; count: number; icon?: string }[];
    languages: { slug: string; label: string; href: string; count: number; icon?: string }[];
    segments: { slug: string; label: string; href: string; count: number; icon?: string }[];
    headerChips: { slug: string; label: string; href: string; count: number; icon?: string }[];
    nicheCanonicalTo: Record<string, string>;
  };
  nicheReport: {
    counts: Record<string, number>;
    matureUnder40: number;
    overlapMatureMilf: number;
  };
};
