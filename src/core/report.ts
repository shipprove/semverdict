import type { SemVerdictReport, SurfaceChange } from "./types.js";

export function createReport(changes: SurfaceChange[], toolVersion: string): SemVerdictReport {
  const breaking = changes.filter((change) => change.severity === "breaking").length;
  const warnings = changes.filter((change) => change.severity === "warning").length;
  const info = changes.filter((change) => change.severity === "info").length;

  return {
    schemaVersion: "1.0",
    tool: "semverdict",
    toolVersion,
    status: breaking > 0 ? "failed" : "passed",
    summary: {
      breaking,
      warnings,
      info,
      suggestedVersionImpact:
        breaking > 0 ? "major" : warnings > 0 ? "minor-or-patch-review-required" : "no-breaking-change-detected"
    },
    findings: changes
  };
}
