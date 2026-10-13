export const MODEL_INTENT_ROUTES = ["vip", "leaks"] as const;
export type ModelIntentRoute = (typeof MODEL_INTENT_ROUTES)[number];

export function isModelIntentRoute(
  value: string | undefined | null,
): value is ModelIntentRoute {
  if (!value) return false;
  return (MODEL_INTENT_ROUTES as readonly string[]).includes(
    value.toLowerCase(),
  );
}

export function buildModelIntentPageH1(
  displayName: string,
  intent: ModelIntentRoute,
): string {
  const name = displayName.trim() || "Model";
  if (intent === "vip") {
    return `${name} — VIP private cam access`;
  }
  return `${name} — gallery & media hub`;
}
