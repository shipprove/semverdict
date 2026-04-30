# SemVerdict

Detect breaking-change risks from the actual public surface of your package.

SemVerdict is a CLI and planned GitHub Action for JavaScript and TypeScript package maintainers. It compares a previous release with the current artifact and reports SemVer-relevant changes in package exports, binaries, TypeScript declaration entries, and CLI help output.

This repository is in the initial implementation phase. The CLI can capture this package's public surface locally, but the public package and GitHub Action are not published yet.

## Why

Release decisions often rely on commit messages, PR titles, changelog entries, or memory. Users experience something more concrete: the package surface they import, execute, and configure.

SemVerdict focuses on that surface so maintainers can catch compatibility risks before release:

- removed `package.json#exports` subpaths
- removed or broken `package.json#bin` commands
- missing TypeScript declaration entry points
- removed CLI flags or subcommands from configured `--help` snapshots
- mismatches between intended version bumps and artifact reality

## Status

SemVerdict is pre-MVP.

Current local capability:

- capture a public-surface snapshot with `semverdict capture`

Planned dogfood MVP capabilities:

- compare the current package against a committed saved snapshot
- classify changes as `breaking`, `warning`, or `info`
- produce terminal, JSON, Markdown, and GitHub Step Summary reports
- support CI gating through `fail-on: breaking | error | never`

## Planned CLI

```sh
semverdict init
semverdict capture
semverdict diff
semverdict check
semverdict report
```

Example target workflow:

```sh
pnpm build
node dist/cli/index.js capture --output .semverdict/baseline.json
```

## Planned Configuration

```ts
import { defineConfig } from "@shipprove/semverdict";

export default defineConfig({
  packageManager: "npm",
  baseline: "npm:@scope/package@latest",
  current: ".",
  analyzers: {
    packageExports: true,
    packageBin: true,
    typesEntry: true,
    cliHelp: {
      enabled: true,
      commands: [
        {
          name: "my-cli",
          command: "my-cli --help"
        }
      ]
    }
  },
  failOn: "breaking",
  report: {
    formats: ["terminal", "json", "markdown"],
    outputDir: ".semverdict"
  }
});
```

## Planned GitHub Action

```yaml
name: SemVerdict

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  semverdict:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: corepack enable
      - run: npm ci
      - run: npm run build
      - uses: shipprove/semverdict@v0
        with:
          baseline: npm:@scope/package@latest
          fail-on: breaking
```

PR comments are planned as opt-in. GitHub Step Summary should be the default reporting target.

## Relationship to Other Tools

SemVerdict complements release and package-quality tools. It does not replace Changesets, semantic-release, release-please, API Extractor, publint, or Are The Types Wrong?.

Its role is to turn public-surface differences into reviewable SemVer evidence.

Within the ShipProve portfolio:

- SemVerdict detects public-surface changes and SemVer risk.
- PackTrial validates package artifacts in generated synthetic consumer projects.
- EcoTrial validates candidate releases against real downstream projects.

## Security and Privacy

SemVerdict should not collect telemetry by default.

It should only access the network when required by configured operations, such as downloading a baseline package, installing dependencies, or resolving package metadata for a check.

Workflows that execute package scripts or configured CLI commands should not use privileged `pull_request_target` patterns for untrusted code. Prefer minimal permissions such as:

```yaml
permissions:
  contents: read
```

Reports should avoid embedding unredacted full command output and should apply best-effort redaction for obvious secrets.

## Contributing

The project is currently being bootstrapped. Until `CONTRIBUTING.md` exists, contributors should:

- keep changes aligned with `00-docs/semverdict-mvp-plan.md`
- keep MVP scope narrow
- add focused tests for behavior changes
- document unresolved product decisions before coding around them
- preserve English as the source of truth for user-facing docs and machine-readable interfaces

## License

Apache-2.0. See `LICENSE`.
