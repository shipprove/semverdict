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
