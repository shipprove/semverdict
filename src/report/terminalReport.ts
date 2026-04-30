import type { SemVerdictReport } from "../core/types.js";

export function renderTerminalReport(report: SemVerdictReport): string {
  const lines = [
    "Surface Contract Report",
    "",
    `Status: ${report.status}`,
    `Suggested version impact: ${report.summary.suggestedVersionImpact}`,
    `Breaking: ${report.summary.breaking}`,
    `Warnings: ${report.summary.warnings}`,
    `Info: ${report.summary.info}`
  ];

  if (report.findings.length > 0) {
    lines.push("", "Findings:");
    for (const finding of report.findings) {
      lines.push(`  [${finding.severity}] ${finding.code}: ${finding.message}`);
    }
  }

  return `${lines.join("\n")}\n`;
}
