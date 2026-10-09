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

function normalizePath(pathname: string): string {
  const base = pathname.split("?")[0] ?? pathname;
  if (base.length > 1 && base.endsWith("/")) return base.slice(0, -1);
  return base;
}

export function isAgeGateLegalPath(pathname: string): boolean {
  const path = normalizePath(pathname);
  return AGE_GATE_LEGAL_PATH_PREFIXES.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );
}

export function shouldSkipAgeGatePath(pathname: string): boolean {
  if (!pathname) return true;
  const path = normalizePath(pathname);
  if (path.startsWith("/api")) return true;
  return isAgeGateLegalPath(path);
}
