import type { SuppressionConfig } from "../config/types.js";
import type { SurfaceChange } from "./types.js";

export function applySuppressions(changes: SurfaceChange[], suppressions: SuppressionConfig[], now = new Date()): SurfaceChange[] {
  return changes.filter((change) => !isSuppressed(change, suppressions, now));
}

function isSuppressed(change: SurfaceChange, suppressions: SuppressionConfig[], now: Date): boolean {
  return suppressions.some((suppression) => {
    if (suppression.code !== change.code) return false;
    if (suppression.target && suppression.target !== change.target) return false;
    if (isExpired(suppression, now)) return false;
    return suppression.reason.trim().length > 0;
  });
}

function isExpired(suppression: SuppressionConfig, now: Date): boolean {
  if (!suppression.until) return false;
  const until = new Date(`${suppression.until}T23:59:59.999Z`);
  return Number.isNaN(until.getTime()) ? true : until.getTime() < now.getTime();
}
