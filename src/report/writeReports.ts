import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { ResolvedSemVerdictConfig } from "../config/types.js";
import type { SemVerdictReport } from "../core/types.js";
import { redact } from "../utils/redact.js";
import { writeJsonFile } from "../utils/fs.js";
import { renderMarkdownReport } from "./markdownReport.js";
import { renderTerminalReport } from "./terminalReport.js";

export async function writeReports(report: SemVerdictReport, config: ResolvedSemVerdictConfig): Promise<void> {
  await mkdir(config.report.outputDir, { recursive: true });

  for (const format of config.report.formats) {
    if (format === "terminal") {
      process.stdout.write(redact(renderTerminalReport(report)));
    }
    if (format === "json") {
      await writeJsonFile(join(config.report.outputDir, "report.json"), report);
    }
    if (format === "markdown") {
      await writeMarkdown(join(config.report.outputDir, "report.md"), renderMarkdownReport(report), config);
    }
    if (format === "github-summary" && process.env.GITHUB_STEP_SUMMARY) {
      await appendFile(process.env.GITHUB_STEP_SUMMARY, redact(renderMarkdownReport(report)), "utf8");
    }
  }
}

async function writeMarkdown(path: string, value: string, config: ResolvedSemVerdictConfig): Promise<void> {
  const redacted = redact(value);
  if (Buffer.byteLength(redacted) > config.limits.maxReportBytes) {
    throw new Error(`Markdown report exceeded ${config.limits.maxReportBytes} bytes`);
  }
  await mkdir(config.report.outputDir, { recursive: true });
  await import("node:fs/promises").then(({ writeFile }) => writeFile(path, redacted, "utf8"));
}
