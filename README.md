# Browser Tetris

A browser-based Tetris project with a playable-classic-first delivery target. The complete intended scope includes modern play, a penetrator bonus, configurable assistance, cookie/URL settings persistence, a session leaderboard and manual JSON/SQLite result files.

Playable classic Tetris includes movement, rotation, line clearing, scoring/levels, pause, game over and restart. Controlled keyboard repeat and automatic blur/visibility pause are implemented. Release [0.1.0](https://github.com/pchemguy/SDD-Manager-Demo-Tetris-ChatGPT-Autodoc-AIO-V6/releases/tag/v0.1.0) is published with a static ZIP and checksum. Current development adds seven-bag generation, full SRS wall kicks and a next-piece preview; ghost, hard drop and hold follow in phase 2. Read the accepted [PROJECT brief](docs/dev/PROJECT.md), [preparation record](docs/dev/DOCS_PREPARATION.md) and [workflow handoff](docs/dev/HANDOFF.md). The user accepted the brief and its presented gameplay and technology decisions; detailed design, specification, delivery plan and the [implementation task list](docs/dev/TASKS.md) are available. Whole-package QC passed and the document baseline is integrated. Full implementation is authorized and tracked by phase.

See [SDD Manager usage](SDD-MANAGER.md) and the [AI-assisted development disclosure](AI_DISCLOSURE.md). Development follows the [project instructions](AGENTS.md) and [browser development policy](BROWSER_DEV_POLICY.md).

## Development checks

Use Node.js 24 and the committed lockfile. These commands were verified on Linux for the board/geometry increment:

```text
npm ci --ignore-scripts
npm test
npm run check
```

`npm run dev` starts the local game; `npm run build` produces static assets in `dist/`. Build, 55 unit tests and 32 browser checks have passed on Linux in Chromium and Firefox for the current next-preview increment. Hosted CI passed for the published classic baseline; see milestone reports for evidence and limits. Windows follows WINDOWS_SHELL_POLICY.md; no PowerShell is required.

## Browser checks

Set `PLAYWRIGHT_BROWSERS_PATH` to an absolute dedicated directory for installation and execution. The test config defaults to this repository's `.cache/playwright`. Provision the locked runner's matching Chromium headless shell and Firefox with `node node_modules/playwright/cli.js install --only-shell chromium firefox`, then run `npm run test:browser`.

On this restricted Linux host, Firefox content processes failed with `/proc/self/uid_map: EPERM`; the policy-approved trusted-local-only override was verified with repeated contexts, interaction, Canvas screenshots and teardown. Set `TETRIS_FIREFOX_NO_CONTENT_SANDBOX=1` only for that diagnosed environment. The flag affects Firefox test launch only. Normal hosts/CI use the default sandbox. See the milestone report for exact official download fallback evidence and resource-lifetime limits.

Browser evidence distinguishes native keyboard/DOM-control focus from modeled window-blur/visibility events. This headless runner reports `document.hasFocus()` true for selected/background pages, even in controlled probes with focus overrides disabled. Native OS-window/tab focus and visibility transitions are not established here; the suite verifies the corresponding application handlers and pause composition with modeled events, without claiming OS-window evidence.

## Distribution and CI

`npm run package` builds the static game and writes `.cache/releases/browser-tetris.zip` plus its SHA-256 file. Python 3.11+ is needed only for packaging or the optional local static server. The ZIP contains the playable entry/assets, license, use instructions and BUILD.json version/source/dirty metadata. Sorted members, fixed timestamps and modes make repeated packaging of the same tree reproducible. A dirty candidate is not a verified release source.

The [player guide](docs/user/CONTROLS.md) describes the delivered controls and HTTP serving. The CI workflow checks main integrations and pull requests with Node 24 and both managed browsers; its existence does not imply a hosted run has passed. It has Contents read only and does not publish releases. Workflow action revisions are pinned to the inspected official v7 commits.
