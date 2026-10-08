const DEFAULT_API_BASE =
  "https://performersext-api.pcvdaa.com/performers-ext";

export const CRAK_API_BASE =
  process.env.CRAK_CAM_API_BASE?.trim() || DEFAULT_API_BASE;

export const CRAK_USER_AGENT =
  process.env.CRAK_USER_AGENT?.trim() ||
  "MatureCamRooms/2.0 (+https://maturecamrooms.com)";

export const CRAK_LANDING_ID_RAW =
  process.env.CRAK_LANDING_ID?.trim() ||
  process.env.CRACKREVENUE_LANDING_ID?.trim() ||
  "";

export function getCrakCredentials(): {
  apiKey: string;
  token: string;
} | null {
  const apiKey = (
    process.env.CRAK_API_KEY ??
    process.env.CRAKREVENUE_API_KEY ??
    ""
  ).trim();
  const token = (
    process.env.CRAK_TOKEN ??
    process.env.CRAKREVENUE_API_TOKEN ??
    process.env.CRACKREVENUE_TOKEN ??
    ""
  ).trim();
  if (!apiKey || !token) return null;
  return { apiKey, token };
}

export function resolveCrakBrands(): string {
  const brands = process.env.CRAK_BRANDS?.trim();
  return brands && brands.length > 0 ? brands : "streamate";
}

export function isCrakConfigured(): boolean {
  return getCrakCredentials() !== null;
}

export class CrakConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CrakConfigError";
  }
}
