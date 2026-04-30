import { join } from "node:path";
import { readJsonFile } from "../utils/fs.js";

export type PackageJson = {
  name?: string;
  version?: string;
  exports?: unknown;
  bin?: Record<string, string> | string;
  types?: string;
  typings?: string;
};

export async function readPackageJson(packageRoot: string): Promise<PackageJson> {
  const value = await readJsonFile(join(packageRoot, "package.json"));
  if (!isRecord(value)) {
    throw new Error("package.json must be a JSON object");
  }

  return {
    name: typeof value.name === "string" ? value.name : undefined,
    version: typeof value.version === "string" ? value.version : undefined,
    exports: value.exports,
    bin: normalizeBinField(value.bin),
    types: typeof value.types === "string" ? value.types : undefined,
    typings: typeof value.typings === "string" ? value.typings : undefined
  };
}

function normalizeBinField(value: unknown): Record<string, string> | string | undefined {
  if (typeof value === "string") {
    return value;
  }
  if (!isRecord(value)) {
    return undefined;
  }

  const entries = Object.entries(value).filter((entry): entry is [string, string] => {
    return typeof entry[1] === "string";
  });

  return Object.fromEntries(entries);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
