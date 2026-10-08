/** Deterministic 0..n-1 from stable id (same model => same template). */
export function templateIndex(stableId: string, modulo: number): number {
  if (modulo <= 1) return 0;
  let hash = 0;
  for (let i = 0; i < stableId.length; i++) {
    hash = (hash * 31 + stableId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % modulo;
}
