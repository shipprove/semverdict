import { join } from "node:path";
import type { ExportSurface } from "../core/types.js";
import { pathExists } from "../utils/fs.js";
import { isRecord } from "./packageJsonAnalyzer.js";

export async function analyzeExports(packageRoot: string, exportsField: unknown): Promise<ExportSurface[]> {
  const normalized = normalizeExports(exportsField);
  return Promise.all(
    normalized.map(async (entry) => ({
      ...entry,
      targetExists: await pathExists(join(packageRoot, entry.target))
    }))
  );
}

type ExportEntry = {
  subpath: string;
  condition?: string;
  target: string;
};

function normalizeExports(value: unknown): ExportEntry[] {
  if (typeof value === "string") {
    return [{ subpath: ".", target: value }];
  }
  if (!isRecord(value)) {
    return [];
  }

  const entries: ExportEntry[] = [];
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === "string") {
      entries.push({ subpath: key, target: item });
      continue;
    }
    if (isRecord(item)) {
      for (const nested of flattenConditions(key, item)) {
        entries.push(nested);
      }
    }
  }
  return entries.sort(compareExportEntry);
}

function flattenConditions(subpath: string, value: Record<string, unknown>, prefix = ""): ExportEntry[] {
  const entries: ExportEntry[] = [];
  for (const [condition, item] of Object.entries(value)) {
    const conditionName = prefix ? `${prefix}.${condition}` : condition;
    if (typeof item === "string") {
      entries.push({ subpath, condition: conditionName, target: item });
      continue;
    }
    if (isRecord(item)) {
      entries.push(...flattenConditions(subpath, item, conditionName));
    }
  }
  return entries;
}

function compareExportEntry(left: ExportEntry, right: ExportEntry): number {
  return `${left.subpath}:${left.condition ?? ""}`.localeCompare(`${right.subpath}:${right.condition ?? ""}`);
}
