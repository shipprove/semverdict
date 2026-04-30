export type SurfaceSnapshot = {
  schemaVersion: "1";
  package: {
    name: string;
    version?: string;
    packageJson: {
      exports?: unknown;
      bin?: Record<string, string> | string;
      types?: string;
      typings?: string;
    };
  };
  exports: ExportSurface[];
  bins: BinSurface[];
  types: TypeEntrySurface[];
  cliHelp: CliHelpSurface[];
  metadata: {
    capturedAt: string;
    source: string;
  };
};

export type ChangeSeverity = "breaking" | "warning" | "info";

export type SurfaceChange = {
  code:
    | "EXPORT_REMOVED"
    | "EXPORT_TARGET_MISSING"
    | "BIN_REMOVED"
    | "BIN_TARGET_MISSING"
    | "BIN_SHEBANG_MISSING"
    | "TYPES_ENTRY_REMOVED"
    | "TYPES_ENTRY_MISSING"
    | "CLI_FLAG_REMOVED"
    | "CLI_COMMAND_REMOVED";
  severity: ChangeSeverity;
  message: string;
  target: string;
  before?: unknown;
  after?: unknown;
};

export type CheckStatus = "passed" | "failed" | "error";

export type SemVerdictReport = {
  schemaVersion: "1.0";
  tool: "semverdict";
  toolVersion: string;
  status: CheckStatus;
  summary: {
    breaking: number;
    warnings: number;
    info: number;
    suggestedVersionImpact: "major" | "minor-or-patch-review-required" | "no-breaking-change-detected";
  };
  findings: SurfaceChange[];
};

export type ExportSurface = {
  subpath: string;
  condition?: string;
  target: string;
  targetExists: boolean;
};

export type BinSurface = {
  name: string;
  target: string;
  targetExists: boolean;
  hasShebang?: boolean;
};

export type TypeEntrySurface = {
  source: "types" | "typings" | "exports";
  path: string;
  exists: boolean;
};

export type CliHelpSurface = {
  name: string;
  command: string;
  normalizedOutput: string;
  flags: string[];
  subcommands: string[];
};
