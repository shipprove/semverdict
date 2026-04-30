# Changelog

All notable changes to SemVerdict will be documented in this file.

This project intends to follow SemVer once packages are published. During `0.x`, public interfaces may still evolve, but changes to CLI commands, config keys, diagnostic codes, JSON report schema, and GitHub Action inputs should be documented here.

## Unreleased

### Added

- Initial repository documentation for SemVerdict.
- Initial README for users and contributors.
- Initial changelog.
- TypeScript package foundation for the SemVerdict CLI.
- `semverdict capture` for package exports, bin, and declaration entry snapshots.
- `semverdict check` for comparing the current package against a committed snapshot.
- Terminal, JSON, and Markdown report output for local dogfooding.
- Initial dogfood baseline and JSON config.
- Initial decision log.
- GitHub Actions workflow for build, tests, and dogfood checking.
