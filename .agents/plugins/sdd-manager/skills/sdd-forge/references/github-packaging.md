# Prepare a GitHub release package

Use for a supplied ZIP, an existing package/build definition, or an interactive request to develop release packaging. Preparing packages or a workflow does not itself request a product release. Coordinate repository edits and their commits/pushes through **sdd-manage**; this reference supplies the package procedure. Release preparation is independent of optional task tracking and does not require TASKS when no task list governs the request.

## Establish the package contract

1. Use the current orientation and [GitHub repository/access](github.md#repository-and-access) handoff. Identify the intended distributable, source commit, authoritative inputs, requested outputs and stopping boundary. Inspect existing build/release tooling before proposing replacements.
2. Accept an archive or preliminary description as a seed. Establish intended users, archive format, root layout, required files, exclusions, entry points, installation/use expectations, version source and actual variants. Reuse sufficient project instructions and ordinary defaults; ask only for consequential unresolved choices. A platform, runtime or installer choice can require interactive development over several turns.
3. Retain accepted decisions, assumptions and remaining questions in existing build/project documentation or the active record. On continuation, compare those decisions with actual source/output state and resume pending work. Do not invent a registry or replay settled choices.
4. For a simple tracked-source package, an explicit `git archive` inventory may suffice. For compiled/generated content, establish dependency/runtime versions, build steps and the origin of each output. Do not demand that all package members be tracked files. Prefer the same build/verification procedure locally and in CI, with platform-specific differences documented.

## Assess the actual archive

Inspect member names and metadata before extracting; never execute bundled scripts merely to discover the package. Reject absolute/traversal paths, duplicate or conflicting entries and unsafe link targets. Account for extraction limits, archive corruption, encryption, unsupported features and decompression size before extraction into an owned temporary directory. Reject credential material and exclude Git internals, unrelated development records and accidental local outputs. Preserve permitted independent assessment on a defective input.

Compare required and actual members, internal paths, entry points, applicable licenses/notices, metadata/version and executable modes where relevant. For an input ZIP, map members to the selected source or declared generated outputs; it represents an intended layout, not automatically an approved inventory. Distinguish missing required files, intentional exclusions and unexplained extras. Verify installation/import/startup behavior appropriate to the package, without executing untrusted input contents. Route necessary changes through the coordinated work boundary.

Build a candidate from the exact source and inspect its actual output using **sdd-verify**'s [package and release checks](../../sdd-verify/references/release-checks.md). Record member/content comparison, source SHA, version, runtime and SHA-256 hashes. Equivalent layout does not prove identical bytes; reproducible builds require the appropriate repeated-build evidence and control of timestamps/order/modes and other variable inputs.

## Names and URLs

Keep release asset filenames free of version numbers. Tags and embedded metadata retain version identity. Use one general `<project>.zip` when sufficient; several assets use conventional suffixes only for actual distinguishing dimensions. Examples:

| Asset purpose | Example |
| --- | --- |
| General package | `project.zip` |
| Windows x64 build | `project-windows-x64.zip` |
| Linux ARM64 build | `project-linux-arm64.tar.gz` |
| macOS ARM64 build | `project-macos-arm64.zip` |
| Separate source package | `project-source.zip` |

Respect established ecosystem vocabulary such as `amd64` where appropriate; examples do not require these variants or extensions. Preserve spelling, case and extension across releases and check uniqueness across the complete variant set. Renaming/removing a public filename is a consequential compatibility decision.

Use these [GitHub latest-release links](https://docs.github.com/en/repositories/releasing-projects-on-github/linking-to-releases):

```text
https://github.com/{OWNER}/{REPO}/releases/latest
https://github.com/{OWNER}/{REPO}/releases/latest/download/{ASSET_NAME}
```

Define the expected asset set for each stable release. The repository-wide latest pointer cannot fall back to an older release for a missing variant. Verify that the latest release includes each advertised asset; drafts/prereleases cannot be latest stable. A private repository's URLs retain its access requirements. Do not promise a universal latest-prerelease alias.

Explicitly attached packages differ from GitHub's automatic source ZIP/tarball downloads and from temporary Actions artifacts used between jobs. Return tag-specific URLs as well when consumers need pinned versions. Use `<asset>.sha256` for a simple package or a stable `SHA256SUMS` for several assets; hashes must describe the actual uploaded bytes.

## Prepare and hand off the workflow

Use [release workflow preparation](github-release-workflows.md) to create/extend the appropriate workflow and its build/verification procedure. Return accepted package layout, source/version, asset names and required set, checksums, performed checks, remaining questions and changed files. Stop at the requested preparation boundary. A request to actually release continues through [release creation](github-releases.md); do not publish merely because a candidate archive exists.
