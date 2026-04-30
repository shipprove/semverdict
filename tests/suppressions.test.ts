import { describe, expect, it } from "vitest";
import { applySuppressions } from "../src/core/suppressions.js";
import type { SurfaceChange } from "../src/core/types.js";

describe("applySuppressions", () => {
  it("suppresses exact active matches", () => {
    expect(
      applySuppressions(
        [change()],
        [{ code: "EXPORT_REMOVED", target: "./old", reason: "Intentional removal before v1", until: "2099-01-01" }]
      )
    ).toEqual([]);
  });

  it("keeps expired suppressions active as findings", () => {
    expect(
      applySuppressions(
        [change()],
        [{ code: "EXPORT_REMOVED", target: "./old", reason: "Expired", until: "1999-01-01" }],
        new Date("2026-04-30T00:00:00.000Z")
      )
    ).toEqual([change()]);
  });
});

function change(): SurfaceChange {
  return {
    code: "EXPORT_REMOVED",
    severity: "breaking",
    message: "Removed export ./old",
    target: "./old"
  };
}
