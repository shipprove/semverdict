#!/usr/bin/env node
import { captureSurface } from "../core/captureSurface.js";
import { writeJsonFile } from "../utils/fs.js";

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
    const snapshot = await captureSurface(current);
    await writeJsonFile(output, snapshot);
    console.log(`Captured public surface to ${output}`);
    return { exitCode: 0 };
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

Commands:
  capture    Capture the current package public surface
`);
}

main(process.argv.slice(2))
  .then(({ exitCode }) => {
    process.exitCode = exitCode;
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 2;
  });
