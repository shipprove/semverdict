import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { BinSurface } from "../core/types.js";
import { pathExists } from "../utils/fs.js";

export async function analyzeBins(
  packageRoot: string,
  packageName: string,
  binField: Record<string, string> | string | undefined
): Promise<BinSurface[]> {
  const bins = normalizeBins(packageName, binField);
  return Promise.all(
    bins.map(async ([name, target]) => {
      const absoluteTarget = join(packageRoot, target);
      const targetExists = await pathExists(absoluteTarget);
      return {
        name,
        target,
        targetExists,
        hasShebang: targetExists ? await hasShebang(absoluteTarget) : false
      };
    })
  );
}

function normalizeBins(packageName: string, binField: Record<string, string> | string | undefined): [string, string][] {
  if (typeof binField === "string") {
    return [[unscopedName(packageName), binField]];
  }
  if (!binField) {
    return [];
  }
  return Object.entries(binField).sort(([left], [right]) => left.localeCompare(right));
}

async function hasShebang(path: string): Promise<boolean> {
  const content = await readFile(path, "utf8");
  return content.startsWith("#!");
}

function unscopedName(packageName: string): string {
  return packageName.split("/").at(-1) ?? packageName;
}
