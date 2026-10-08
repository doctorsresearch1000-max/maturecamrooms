import { readCrakRuntimeEnv } from "@/lib/crak/diagnostics";

const DEFAULT_API_BASE =
  "https://performersext-api.pcvdaa.com/performers-ext";

export function getCrakApiBase(): string {
  return readCrakRuntimeEnv("CRAK_CAM_API_BASE") || DEFAULT_API_BASE;
}

/** @deprecated Use getCrakApiBase() — kept for imports that expect a constant. */
export const CRAK_API_BASE = DEFAULT_API_BASE;

export function getCrakUserAgent(): string {
  return (
    readCrakRuntimeEnv("CRAK_USER_AGENT") ||
    "MatureCamRooms/2.0 (+https://maturecamrooms.com)"
  );
}

/** @deprecated Use getCrakUserAgent() */
export const CRAK_USER_AGENT =
  "MatureCamRooms/2.0 (+https://maturecamrooms.com)";

export function getCrakLandingIdRaw(): string {
  return (
    readCrakRuntimeEnv("CRAK_LANDING_ID") ||
    readCrakRuntimeEnv("CRACKREVENUE_LANDING_ID") ||
    ""
  );
}

export const CRAK_LANDING_ID_RAW = "";

export function getCrakCredentials(): {
  apiKey: string;
  token: string;
} | null {
  const apiKey = (
    readCrakRuntimeEnv("CRAK_API_KEY") ||
    readCrakRuntimeEnv("CRAKREVENUE_API_KEY") ||
    ""
  ).trim();
  const token = (
    readCrakRuntimeEnv("CRAK_TOKEN") ||
    readCrakRuntimeEnv("CRAKREVENUE_API_TOKEN") ||
    readCrakRuntimeEnv("CRACKREVENUE_TOKEN") ||
    ""
  ).trim();
  if (!apiKey || !token) return null;
  return { apiKey, token };
}

export function resolveCrakBrands(): string {
  const brands = readCrakRuntimeEnv("CRAK_BRANDS");
  return brands.length > 0 ? brands : "streamate";
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
