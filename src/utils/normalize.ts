export function normalizeHelpOutput(value: string): string {
  return value
    .replace(/\u001b\[[0-9;]*m/g, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/\r\n/g, "\n")
    .trim();
}

export function extractFlags(value: string): string[] {
  return unique(value.match(/--[a-zA-Z0-9][a-zA-Z0-9-]*/g) ?? []);
}

export function extractSubcommands(value: string): string[] {
  const commandsSection = value.match(/Commands?:\n(?<body>(?:\s{2,}.+\n?)+)/i)?.groups?.body;
  if (!commandsSection) {
    return [];
  }

  return unique(
    commandsSection
      .split("\n")
      .map((line) => line.trim().split(/\s+/)[0])
      .filter((command) => command && !command.startsWith("-"))
  );
}

function unique(values: string[]): string[] {
  return [...new Set(values)].sort();
}
