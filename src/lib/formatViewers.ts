/** Compact viewer count for card overlays (e.g. 1200 → 1.2k). */
export function formatViewerCount(count: number): string {
  if (count < 1000) return String(count);
  if (count < 1_000_000) {
    const k = count / 1000;
    return k >= 10 ? `${Math.round(k)}k` : `${k.toFixed(1).replace(/\.0$/, "")}k`;
  }
  const m = count / 1_000_000;
  return `${m.toFixed(1).replace(/\.0$/, "")}m`;
}
