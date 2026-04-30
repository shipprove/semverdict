import type { SemVerdictReport } from "../core/types.js";

export function renderMarkdownReport(report: SemVerdictReport): string {
  const lines = [
    "## Surface Contract Report",
    "",
    `**Status:** ${report.status}`,
    "",
    `**Suggested version impact:** ${report.summary.suggestedVersionImpact}`,
    "",
    "| Severity | Code | Message |",
    "|---|---|---|"
  ];

  if (report.findings.length === 0) {
    lines.push("| info | NO_FINDINGS | No compatibility risk detected. |");
  } else {
    for (const finding of report.findings) {
      lines.push(`| ${finding.severity} | \`${finding.code}\` | ${escapeTable(finding.message)} |`);
    }
  }

  return `${lines.join("\n")}\n`;
}

function escapeTable(value: string): string {
  return value.replace(/\|/g, "\\|");
}
