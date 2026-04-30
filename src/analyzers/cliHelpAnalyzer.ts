import type { CliHelpCommandConfig } from "../config/types.js";
import type { CliHelpSurface } from "../core/types.js";
import { runCommand, type ExecLimits } from "../utils/exec.js";
import { extractFlags, extractSubcommands, normalizeHelpOutput } from "../utils/normalize.js";

export async function analyzeCliHelp(commands: CliHelpCommandConfig[], limits: ExecLimits): Promise<CliHelpSurface[]> {
  return Promise.all(
    commands.map(async (entry) => {
      const output = normalizeHelpOutput(await runCommand(entry.command, limits));
      return {
        name: entry.name,
        command: entry.command,
        normalizedOutput: output,
        flags: extractFlags(output),
        subcommands: extractSubcommands(output)
      };
    })
  );
}
