/** Central age-gate configuration — swap implementation here later without touching UI shells. */
export const AGE_GATE_STORAGE_KEY = "mcr_age_gate_accepted_at";

/** Confirmation remembered for 30 days. */
export const AGE_GATE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export const AGE_GATE_EXIT_URL = "https://www.google.com";

export const AGE_GATE_LEGAL_PATH_PREFIXES = [
  "/terms",
  "/privacy",
  "/dmca",
  "/2257",
] as const;

export function isAgeGateLegalPath(pathname: string): boolean {
  const path = pathname.split("?")[0] ?? pathname;
  return AGE_GATE_LEGAL_PATH_PREFIXES.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );
}

export function shouldSkipAgeGatePath(pathname: string): boolean {
  if (!pathname) return true;
  if (pathname.startsWith("/api")) return true;
  return isAgeGateLegalPath(pathname);
}
