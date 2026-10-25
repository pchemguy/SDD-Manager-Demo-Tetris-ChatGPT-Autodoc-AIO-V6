# Browser Tetris

A browser-based Tetris project with a playable-classic-first delivery target. The complete intended scope includes modern play, a penetrator bonus, configurable assistance, cookie/URL settings persistence, a session leaderboard and manual JSON/SQLite result files.

Implementation has started with deterministic board/geometry rules. No playable build is available yet. Read the accepted [PROJECT brief](docs/dev/PROJECT.md), [preparation record](docs/dev/DOCS_PREPARATION.md) and [workflow handoff](docs/dev/HANDOFF.md). The user accepted the brief and its presented gameplay and technology decisions; detailed design, specification, delivery plan and the unchecked [implementation task list](docs/dev/TASKS.md) are available. Whole-package QC passed and the document baseline is integrated. Full implementation is authorized and tracked by phase.

See [SDD Manager usage](SDD-MANAGER.md) and the [AI-assisted development disclosure](AI_DISCLOSURE.md). Development follows the [project instructions](AGENTS.md) and [browser development policy](BROWSER_DEV_POLICY.md).

## Development checks

Use Node.js 24 and the committed lockfile. These commands were verified on Linux for the board/geometry increment:

```text
npm ci --ignore-scripts
npm test
npm run check
```

The static build and browser acceptance become available with the playable-loop task. Windows follows WINDOWS_SHELL_POLICY.md; no PowerShell is required.
