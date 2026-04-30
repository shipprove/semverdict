import { join } from "node:path";
import type { TypeEntrySurface } from "../core/types.js";
import { pathExists } from "../utils/fs.js";
import { isRecord } from "./packageJsonAnalyzer.js";

export async function analyzeTypesEntries(
  packageRoot: string,
  packageJson: { exports?: unknown; types?: string; typings?: string }
): Promise<TypeEntrySurface[]> {
  const entries = collectTypesEntries(packageJson);
  return Promise.all(
    entries.map(async (entry) => ({
      ...entry,
      exists: await pathExists(join(packageRoot, entry.path))
    }))
  );
}

function collectTypesEntries(packageJson: { exports?: unknown; types?: string; typings?: string }): Omit<TypeEntrySurface, "exists">[] {
  const entries: Omit<TypeEntrySurface, "exists">[] = [];
  if (packageJson.types) {
    entries.push({ source: "types", path: packageJson.types });
  }
  if (packageJson.typings) {
    entries.push({ source: "typings", path: packageJson.typings });
  }
  entries.push(...collectExportTypes(packageJson.exports));
  return dedupe(entries);
}

function collectExportTypes(value: unknown): Omit<TypeEntrySurface, "exists">[] {
  if (!isRecord(value)) {
    return [];
  }

  const entries: Omit<TypeEntrySurface, "exists">[] = [];
  for (const item of Object.values(value)) {
    if (isRecord(item) && typeof item.types === "string") {
      entries.push({ source: "exports", path: item.types });
    }
  }
  return entries;
}

function dedupe(entries: Omit<TypeEntrySurface, "exists">[]): Omit<TypeEntrySurface, "exists">[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    const key = `${entry.source}:${entry.path}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
