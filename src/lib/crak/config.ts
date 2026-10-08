export const CRAK_API_BASE =
  "https://performersext-api.pcvdaa.com/performers-ext";

export const CRAK_USER_AGENT =
  "MatureCamRooms/2.0 (+https://maturecamrooms.com)";

export function getCrakCredentials(): {
  apiKey: string;
  token: string;
} | null {
  const apiKey = process.env.CRAKREVENUE_API_KEY?.trim();
  const token = process.env.CRAKREVENUE_API_TOKEN?.trim();
  if (!apiKey || !token) return null;
  return { apiKey, token };
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
