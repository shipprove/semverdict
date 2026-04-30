import { resolve } from "node:path";
import { analyzeBins } from "../analyzers/binAnalyzer.js";
import { analyzeExports } from "../analyzers/exportsAnalyzer.js";
import { readPackageJson } from "../analyzers/packageJsonAnalyzer.js";
import { analyzeTypesEntries } from "../analyzers/typesEntryAnalyzer.js";
import type { SurfaceSnapshot } from "./types.js";

export async function captureSurface(packageRoot = "."): Promise<SurfaceSnapshot> {
  const root = resolve(packageRoot);
  const packageJson = await readPackageJson(root);
  const packageName = packageJson.name ?? "unknown";

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
    exports: await analyzeExports(root, packageJson.exports),
    bins: await analyzeBins(root, packageName, packageJson.bin),
    types: await analyzeTypesEntries(root, packageJson),
    cliHelp: [],
    metadata: {
      capturedAt: new Date().toISOString(),
      source: root
    }
  };
}
