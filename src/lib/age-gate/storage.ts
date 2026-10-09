import {
  AGE_GATE_STORAGE_KEY,
  AGE_GATE_TTL_MS,
} from "@/lib/age-gate/config";

let sessionAccepted = false;

export function markAgeGateAcceptedSession(): void {
  sessionAccepted = true;
}

export function isAgeGateAcceptedSession(): boolean {
  return sessionAccepted;
}

export function readAgeGateAcceptedAt(): number | null {
  try {
    const raw = localStorage.getItem(AGE_GATE_STORAGE_KEY);
    if (!raw) return null;
    const ts = Number.parseInt(raw, 10);
    return Number.isFinite(ts) ? ts : null;
  } catch {
    return null;
  }
}

export function writeAgeGateAcceptedAt(ts: number): void {
  try {
    localStorage.setItem(AGE_GATE_STORAGE_KEY, String(ts));
  } catch {
    markAgeGateAcceptedSession();
  }
}

export function isAgeGateCurrentlyAccepted(): boolean {
  if (sessionAccepted) return true;
  const acceptedAt = readAgeGateAcceptedAt();
  if (!acceptedAt) return false;
  return Date.now() - acceptedAt < AGE_GATE_TTL_MS;
}

export function persistAgeGateAcceptance(): void {
  const now = Date.now();
  writeAgeGateAcceptedAt(now);
  markAgeGateAcceptedSession();
}
