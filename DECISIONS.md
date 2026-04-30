# Decisions

## Dogfood Baseline Before Registry Baselines

Status: accepted

SemVerdict will dogfood itself with a committed local snapshot baseline before implementing registry package baseline resolution.

Reason:

- the repository is not published to npm yet;
- the immediate MVP goal is to make this project detect regressions in its own public surface;
- registry baseline support can be added without changing the committed snapshot workflow.

Consequence:

- `pnpm semverdict:capture` updates `.semverdict/baseline.json` explicitly;
- CI and local checks use `pnpm semverdict:check` against the committed baseline;
- future registry baseline support must preserve snapshot schema compatibility behavior.

## JSON Config for Dogfood CI

Status: accepted

Dogfood CI uses `semverdict.config.json` instead of executable JavaScript or TypeScript config.

Reason:

- JSON config avoids executing config code during pull request checks;
- TypeScript config remains the intended public interface for a later loader;
- this keeps the dogfood path deterministic and small.

Consequence:

- the CLI supports JSON config first;
- executable config support requires separate trust-model documentation before CI use.
