import { resolve } from "node:path";
import { analyzeBins } from "../analyzers/binAnalyzer.js";
import { analyzeCliHelp } from "../analyzers/cliHelpAnalyzer.js";
import { analyzeExports } from "../analyzers/exportsAnalyzer.js";
import { readPackageJson } from "../analyzers/packageJsonAnalyzer.js";
import { analyzeTypesEntries } from "../analyzers/typesEntryAnalyzer.js";
import type { ResolvedSemVerdictConfig } from "../config/types.js";
import type { SurfaceSnapshot } from "./types.js";

export async function captureSurface(packageRoot = ".", config?: Pick<ResolvedSemVerdictConfig, "analyzers" | "limits">): Promise<SurfaceSnapshot> {
  const root = resolve(packageRoot);
  const packageJson = await readPackageJson(root);
  const packageName = packageJson.name ?? "unknown";
  const analyzers = config?.analyzers;
  const cliHelpEnabled = analyzers?.cliHelp.enabled === true && config !== undefined;

  return {
    schemaVersion: "1",
    package: {
      name: packageName,
      version: packageJson.version,
      packageJson: {
        exports: packageJson.exports,
        bin: packageJson.bin,
        types: packageJson.types,
        typings: packageJson.typings
      }
    },
    exports: analyzers?.packageExports === false ? [] : await analyzeExports(root, packageJson.exports),
    bins: analyzers?.packageBin === false ? [] : await analyzeBins(root, packageName, packageJson.bin),
    types: analyzers?.typesEntry === false ? [] : await analyzeTypesEntries(root, packageJson),
    cliHelp: cliHelpEnabled
        ? await analyzeCliHelp(analyzers.cliHelp.commands, {
            timeoutMs: config.limits.perCommandTimeoutMs,
            maxOutputBytes: config.limits.maxOutputBytes
          })
        : [],
    metadata: {
      capturedAt: new Date().toISOString(),
      source: packageRoot
    }
  };
}
