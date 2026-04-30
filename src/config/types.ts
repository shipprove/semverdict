export type SemVerdictConfig = {
  baseline: string;
  current?: string;
  analyzers?: {
    packageExports?: boolean;
    packageBin?: boolean;
    typesEntry?: boolean;
    cliHelp?: {
      enabled?: boolean;
      commands?: CliHelpCommandConfig[];
    };
  };
  failOn?: "breaking" | "error" | "never";
  report?: {
    formats?: ("terminal" | "json" | "markdown" | "github-summary")[];
    outputDir?: string;
  };
  suppressions?: SuppressionConfig[];
  limits?: {
    perCommandTimeoutMs?: number;
    totalTimeoutMs?: number;
    maxOutputBytes?: number;
    maxReportBytes?: number;
  };
};

export type CliHelpCommandConfig = {
  name: string;
  command: string;
};

export type SuppressionConfig = {
  code: string;
  target?: string;
  reason: string;
  until?: string;
};

export type ResolvedSemVerdictConfig = Required<Omit<SemVerdictConfig, "analyzers" | "report" | "limits">> & {
  analyzers: {
    packageExports: boolean;
    packageBin: boolean;
    typesEntry: boolean;
    cliHelp: {
      enabled: boolean;
      commands: CliHelpCommandConfig[];
    };
  };
  report: {
    formats: ("terminal" | "json" | "markdown" | "github-summary")[];
    outputDir: string;
  };
  limits: {
    perCommandTimeoutMs: number;
    totalTimeoutMs: number;
    maxOutputBytes: number;
    maxReportBytes: number;
  };
};
