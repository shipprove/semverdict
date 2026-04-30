import { describe, expect, it } from "vitest";
import { diffSurface } from "../src/core/diffSurface.js";
import type { SurfaceSnapshot } from "../src/core/types.js";

describe("diffSurface", () => {
  it("detects removed exports, bins, types, and cli flags", () => {
    const baseline = snapshot({
      exports: [{ subpath: "./old", target: "./dist/old.js", targetExists: true }],
      bins: [{ name: "old-bin", target: "./dist/old.js", targetExists: true, hasShebang: true }],
      types: [{ source: "types", path: "./dist/index.d.ts", exists: true }],
      cliHelp: [
        {
          name: "cli",
          command: "cli --help",
          normalizedOutput: "--old",
          flags: ["--old"],
          subcommands: []
        }
      ]
    });
    const current = snapshot({
      cliHelp: [
        {
          name: "cli",
          command: "cli --help",
          normalizedOutput: "",
          flags: [],
          subcommands: []
        }
      ]
    });

    expect(diffSurface(baseline, current).map((change) => change.code)).toEqual([
      "EXPORT_REMOVED",
      "BIN_REMOVED",
      "TYPES_ENTRY_REMOVED",
      "CLI_FLAG_REMOVED"
    ]);
  });
});

function snapshot(overrides: Partial<SurfaceSnapshot> = {}): SurfaceSnapshot {
  return {
    schemaVersion: "1",
    package: {
      name: "pkg",
      packageJson: {}
    },
    exports: [],
    bins: [],
    types: [],
    cliHelp: [],
    metadata: {
      capturedAt: "2026-04-30T00:00:00.000Z",
      source: "."
    },
    ...overrides
  };
}
