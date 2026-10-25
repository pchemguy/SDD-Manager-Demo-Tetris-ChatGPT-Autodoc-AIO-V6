# Browser Tetris

A browser-based Tetris project with a playable-classic-first delivery target. The complete intended scope includes modern play, a penetrator bonus, configurable assistance, cookie/URL settings persistence, a session leaderboard and manual JSON/SQLite result files.

Playable classic Tetris includes movement, rotation, line clearing, scoring/levels, pause, game over and restart. Keyboard repeat/focus handling and release packaging are in progress; modern enhancements follow in later phases. Read the accepted [PROJECT brief](docs/dev/PROJECT.md), [preparation record](docs/dev/DOCS_PREPARATION.md) and [workflow handoff](docs/dev/HANDOFF.md). The user accepted the brief and its presented gameplay and technology decisions; detailed design, specification, delivery plan and the unchecked [implementation task list](docs/dev/TASKS.md) are available. Whole-package QC passed and the document baseline is integrated. Full implementation is authorized and tracked by phase.

See [SDD Manager usage](SDD-MANAGER.md) and the [AI-assisted development disclosure](AI_DISCLOSURE.md). Development follows the [project instructions](AGENTS.md) and [browser development policy](BROWSER_DEV_POLICY.md).

## Development checks

Use Node.js 24 and the committed lockfile. These commands were verified on Linux for the board/geometry increment:

```text
npm ci --ignore-scripts
npm test
npm run check
```

`npm run dev` starts the local game; `npm run build` produces static assets in `dist/`. Build and sixteen browser checks have passed on Linux in Chromium and Firefox. Windows follows WINDOWS_SHELL_POLICY.md; no PowerShell is required.

## Browser checks

Set `PLAYWRIGHT_BROWSERS_PATH` to an absolute dedicated directory for installation and execution. The test config defaults to this repository's `.cache/playwright`. Provision the locked runner's matching Chromium headless shell and Firefox with `node node_modules/playwright/cli.js install --only-shell chromium firefox`, then run `npm run test:browser`.

On this restricted Linux host, Firefox content processes failed with `/proc/self/uid_map: EPERM`; the policy-approved trusted-local-only override was verified with repeated contexts, interaction, Canvas screenshots and teardown. Set `TETRIS_FIREFOX_NO_CONTENT_SANDBOX=1` only for that diagnosed environment. The flag affects Firefox test launch only. Normal hosts/CI use the default sandbox. See the milestone report for exact official download fallback evidence and resource-lifetime limits.
