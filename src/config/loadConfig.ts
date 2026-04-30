import { resolve } from "node:path";
import { readJsonFile } from "../utils/fs.js";
import type { ResolvedSemVerdictConfig, SemVerdictConfig } from "./types.js";

export async function loadConfig(configPath = "semverdict.config.json"): Promise<ResolvedSemVerdictConfig> {
  const value = await readJsonFile(resolve(configPath));
  if (!isConfig(value)) {
    throw new Error("SemVerdict config must be a JSON object");
  }
  if (typeof value.baseline !== "string" || value.baseline.length === 0) {
    throw new Error("SemVerdict config requires a baseline path");
  }

  return {
    baseline: value.baseline,
    current: value.current ?? ".",
    failOn: value.failOn ?? "breaking",
    suppressions: value.suppressions ?? [],
    analyzers: {
      packageExports: value.analyzers?.packageExports ?? true,
      packageBin: value.analyzers?.packageBin ?? true,
      typesEntry: value.analyzers?.typesEntry ?? true,
      cliHelp: {
        enabled: value.analyzers?.cliHelp?.enabled ?? false,
        commands: value.analyzers?.cliHelp?.commands ?? []
      }
    },
    report: {
      formats: value.report?.formats ?? ["terminal", "json", "markdown"],
      outputDir: value.report?.outputDir ?? ".semverdict"
    },
    limits: {
      perCommandTimeoutMs: value.limits?.perCommandTimeoutMs ?? 120_000,
      totalTimeoutMs: value.limits?.totalTimeoutMs ?? 1_200_000,
      maxOutputBytes: value.limits?.maxOutputBytes ?? 204_800,
      maxReportBytes: value.limits?.maxReportBytes ?? 262_144
    }
  };
}

function isConfig(value: unknown): value is SemVerdictConfig {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
