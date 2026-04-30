import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { SurfaceSnapshot } from "../core/types.js";

export async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function readJsonFile(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, "utf8"));
}

export async function writeJsonFile(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function readSnapshotFile(path: string): Promise<SurfaceSnapshot> {
  const value = await readJsonFile(path);
  if (!isSnapshot(value)) {
    throw new Error("Snapshot must be a SemVerdict snapshot with schemaVersion 1");
  }
  return value;
}

function isSnapshot(value: unknown): value is SurfaceSnapshot {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "schemaVersion" in value &&
    value.schemaVersion === "1" &&
    "package" in value &&
    "exports" in value &&
    "bins" in value &&
    "types" in value &&
    "cliHelp" in value
  );
}
