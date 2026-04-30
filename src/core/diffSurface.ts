import type { SurfaceChange, SurfaceSnapshot } from "./types.js";

export function diffSurface(baseline: SurfaceSnapshot, current: SurfaceSnapshot): SurfaceChange[] {
  assertSnapshotSchema(baseline);
  assertSnapshotSchema(current);

  return [
    ...diffExports(baseline, current),
    ...diffBins(baseline, current),
    ...diffTypes(baseline, current),
    ...diffCliHelp(baseline, current)
  ];
}

function assertSnapshotSchema(snapshot: SurfaceSnapshot): void {
  if (snapshot.schemaVersion !== "1") {
    throw new Error(`Unsupported snapshot schema version: ${String(snapshot.schemaVersion)}`);
  }
}

function diffExports(baseline: SurfaceSnapshot, current: SurfaceSnapshot): SurfaceChange[] {
  const currentKeys = new Set(current.exports.map((entry) => exportKey(entry)));
  const changes = baseline.exports
    .filter((entry) => !currentKeys.has(exportKey(entry)))
    .map(
      (entry): SurfaceChange => ({
        code: "EXPORT_REMOVED",
        severity: "breaking",
        message: `Removed export ${entry.subpath}${entry.condition ? ` (${entry.condition})` : ""}`,
        target: entry.subpath,
        before: entry
      })
    );

  for (const entry of current.exports) {
    if (!entry.targetExists) {
      changes.push({
        code: "EXPORT_TARGET_MISSING",
        severity: "breaking",
        message: `Export target is missing for ${entry.subpath}`,
        target: entry.subpath,
        after: entry
      });
    }
  }

  return changes;
}

function diffBins(baseline: SurfaceSnapshot, current: SurfaceSnapshot): SurfaceChange[] {
  const currentBins = new Map(current.bins.map((entry) => [entry.name, entry]));
  const changes = baseline.bins
    .filter((entry) => !currentBins.has(entry.name))
    .map(
      (entry): SurfaceChange => ({
        code: "BIN_REMOVED",
        severity: "breaking",
        message: `Removed bin ${entry.name}`,
        target: entry.name,
        before: entry
      })
    );

  for (const entry of current.bins) {
    if (!entry.targetExists) {
      changes.push({
        code: "BIN_TARGET_MISSING",
        severity: "breaking",
        message: `Bin target is missing for ${entry.name}`,
        target: entry.name,
        after: entry
      });
    } else if (entry.hasShebang === false) {
      changes.push({
        code: "BIN_SHEBANG_MISSING",
        severity: "warning",
        message: `Bin target has no shebang for ${entry.name}`,
        target: entry.name,
        after: entry
      });
    }
  }

  return changes;
}

function diffTypes(baseline: SurfaceSnapshot, current: SurfaceSnapshot): SurfaceChange[] {
  const currentKeys = new Set(current.types.map((entry) => `${entry.source}:${entry.path}`));
  const changes = baseline.types
    .filter((entry) => !currentKeys.has(`${entry.source}:${entry.path}`))
    .map(
      (entry): SurfaceChange => ({
        code: "TYPES_ENTRY_REMOVED",
        severity: "breaking",
        message: `Removed declaration entry ${entry.path}`,
        target: entry.path,
        before: entry
      })
    );

  for (const entry of current.types) {
    if (!entry.exists) {
      changes.push({
        code: "TYPES_ENTRY_MISSING",
        severity: "breaking",
        message: `Declaration entry is missing at ${entry.path}`,
        target: entry.path,
        after: entry
      });
    }
  }

  return changes;
}

function diffCliHelp(baseline: SurfaceSnapshot, current: SurfaceSnapshot): SurfaceChange[] {
  const currentByName = new Map(current.cliHelp.map((entry) => [entry.name, entry]));
  const changes: SurfaceChange[] = [];

  for (const before of baseline.cliHelp) {
    const after = currentByName.get(before.name);
    if (!after) {
      changes.push({
        code: "CLI_COMMAND_REMOVED",
        severity: "breaking",
        message: `Removed CLI help command ${before.name}`,
        target: before.name,
        before
      });
      continue;
    }

    for (const flag of before.flags) {
      if (!after.flags.includes(flag)) {
        changes.push({
          code: "CLI_FLAG_REMOVED",
          severity: "breaking",
          message: `Removed CLI flag ${flag} from ${before.name}`,
          target: flag,
          before,
          after
        });
      }
    }
  }

  return changes;
}

function exportKey(entry: { subpath: string; condition?: string }): string {
  return `${entry.subpath}:${entry.condition ?? ""}`;
}
