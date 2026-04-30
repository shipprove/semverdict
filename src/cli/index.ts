#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { loadConfig } from "../config/loadConfig.js";
import { captureSurface } from "../core/captureSurface.js";
import { diffSurface } from "../core/diffSurface.js";
import { createReport } from "../core/report.js";
import { applySuppressions } from "../core/suppressions.js";
import { writeReports } from "../report/writeReports.js";
import { readSnapshotFile, writeJsonFile } from "../utils/fs.js";

type CliResult = {
  exitCode: number;
};

async function main(argv: string[]): Promise<CliResult> {
  const [command, ...args] = argv;

  if (!command || command === "--help" || command === "-h") {
    printHelp();
    return { exitCode: 0 };
  }

  if (command === "capture") {
    const output = readOption(args, "--output") ?? ".semverdict/baseline.json";
    const current = readOption(args, "--current") ?? ".";
    const configPath = readOption(args, "--config");
    const config = configPath ? await loadConfig(configPath) : undefined;
    const snapshot = await captureSurface(current, config);
    await writeJsonFile(output, snapshot);
    console.log(`Captured public surface to ${output}`);
    return { exitCode: 0 };
  }

  if (command === "check") {
    const config = await loadConfig(readOption(args, "--config"));
    const baseline = await readSnapshotFile(config.baseline);
    const current = await captureSurface(config.current, config);
    const changes = applySuppressions(diffSurface(baseline, current), config.suppressions);
    const report = createReport(changes, await readPackageVersion());
    await writeReports(report, config);
    return { exitCode: shouldFail(report.summary.breaking, config.failOn) ? 1 : 0 };
  }

  console.error(`Unknown command: ${command}`);
  printHelp();
  return { exitCode: 2 };
}

function readOption(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) {
    return undefined;
  }
  return args[index + 1];
}

function printHelp(): void {
  console.log(`SemVerdict

Usage:
  semverdict capture --output <path> [--current <path>]
  semverdict check [--config <path>]

Commands:
  capture    Capture the current package public surface
  check      Compare current surface with the configured baseline
`);
}

function shouldFail(breaking: number, failOn: "breaking" | "error" | "never"): boolean {
  return failOn === "breaking" && breaking > 0;
}

async function readPackageVersion(): Promise<string> {
  const packageJson = JSON.parse(await readFile(join(process.cwd(), "package.json"), "utf8")) as { version?: string };
  return packageJson.version ?? "0.0.0";
}

main(process.argv.slice(2))
  .then(({ exitCode }) => {
    process.exitCode = exitCode;
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 2;
  });
