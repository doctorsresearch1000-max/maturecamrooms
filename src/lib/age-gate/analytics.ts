export type AgeGateAnalyticsEvent =
  | "age_gate_shown"
  | "age_gate_accepted"
  | "age_gate_exit";

export function trackAgeGateEvent(
  event: AgeGateAnalyticsEvent,
  detail?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent("mcr:age-gate", {
        detail: { event, ...detail },
      }),
    );
  } catch {
    /* ignore */
  }
}
