export function redact(value: string): string {
  return value
    .replace(/gh[pousr]_[A-Za-z0-9_]{20,}/g, "[REDACTED_GITHUB_TOKEN]")
    .replace(/npm_[A-Za-z0-9]{20,}/g, "[REDACTED_NPM_TOKEN]")
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]{20,}/gi, "Bearer [REDACTED_TOKEN]");
}
