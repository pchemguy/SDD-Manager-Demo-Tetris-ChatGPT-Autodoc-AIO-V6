# Browser Tetris

A static single-player Tetris game with classic scoring and levels, seven-bag randomization, full SRS wall kicks, hold, ghost and hard drop. Four-line clears earn up to three penetrator bonuses: press B to activate a white piece that crosses occupied cells to its deepest legal landing.

Six native settings control assistance and locking. Each restores independently from a valid URL value, saved cookie or default; changes preserve unrelated URL content. Dynamic ghost hides upper/straddling landings. Locking policies are captured at each new or hold-replacement spawn.

Completed games enter a page-lifetime top ten. Manual JSON/SQLite Save and validated atomic Restore preserve stable IDs, safe scores and canonical UTC times. The canonical JSON Schema is downloadable. SQLite runs in a bounded disposable worker with local WASM; all runtime assets are bundled.

Download the static ZIP and checksum from the [latest release](https://github.com/pchemguy/SDD-Manager-Demo-Tetris-ChatGPT-Autodoc-AIO-V6/releases/latest). Extract and serve over HTTP(S), including from a subdirectory. For example:

```text
python -m http.server 8000
```

Open `http://localhost:8000`. No application backend or account is required. See the [controls](docs/user/CONTROLS.md), [configuration](docs/user/CONFIGURATION.md) and [leaderboard/file guide](docs/user/LEADERBOARD.md).

## Development and verification

Use Node.js 24, Python 3.11+ and the committed lockfile. Python supports SQLite fixture/inspection tests and packaging. Commands validated on Linux:

```text
npm ci --ignore-scripts
npm run check
npm test
npm run dev
```

`npm run test:dev` checks first-use SQLite Save and Restore with a separate empty Vite dependency cache for every browser/scenario, in ordinary and linked-source layouts. The linked fixture reproduces the reported filesystem worker entry returning HTML while retaining real Vite transformation, imports, WASM and database operations. The development configuration pre-optimizes `sql.js` to avoid a first-use dependency-rebuild page reload. The dev worker uses the base-prefixed project source route rather than a canonical filesystem URL; production retains its bundled worker. WASM still loads only when SQLite is used. After updating a running checkout, stop the old dev server, restart `npm run dev`, and reload the page.

Vite has limitations with Windows symlinks, junctions and cross-drive mappings. This worker-route workaround addresses the confirmed HTML-response failure; it does not provide general linked-checkout support. If other development assets fail, launch from the real physical checkout path.

`npm run build` creates `dist/`; `npm run package` builds `.cache/releases/browser-tetris.zip` and its SHA-256 file. The 1.0.0 release passed 283 unit tests and 104 packaged Playwright checks across Chromium/Firefox, including actual uploads/downloads, cross-format data preservation, subdirectory local assets and two exact served-byte inventory checks. Independent milestone/phase/product reviews found no remaining code findings. The [verified release outcome](docs/dev/reports/RELEASE-1.0.0-OUTCOME.md) records completed publication and CI. Detailed evidence and limits are in [development reports](docs/dev/reports/), [TASKS](docs/dev/TASKS.md) and [HANDOFF](docs/dev/HANDOFF.md).

## Browser checks

Use an absolute dedicated browser cache for installation and execution. The configuration defaults to `.cache/playwright`. Install the locked runner's compatible Chromium headless shell and Firefox:

```text
node node_modules/playwright/cli.js install --only-shell chromium firefox
npm run test:browser
```

For exact packaged acceptance, run:

```text
npm run package
python scripts/prepare-package-test.py
```

Then set `TETRIS_PACKAGE_TEST=1` in the shell environment and run `npm run test:browser`. The test server mounts the selected ZIP's extracted contents at `/` and `/demo/`; per-browser HTTP checks verify every member against an independent ZIP inventory. Packaged acceptance includes both prefix deployment and ordinary play.

On this restricted Linux host, Firefox content processes failed with `/proc/self/uid_map: EPERM`. The diagnosed trusted-local-only override `TETRIS_FIREFOX_NO_CONTENT_SANDBOX=1` was verified with repeated contexts, native input, Canvas output and teardown. It affects only Firefox test launch. Normal hosts/CI use the default sandbox. Browser setup and governance follow [BROWSER_DEV_POLICY](BROWSER_DEV_POLICY.md).

Native keyboard and DOM-control focus are tested. OS-window/tab visibility and persisted-page events use controlled models; actual native window transitions and BFCache eligibility are unestablished. For 1.0.2, eight fresh-cache development Save/Restore scenarios across ordinary and linked fixtures pass on native Windows CMD and Linux CI in Chromium/Firefox. The user also confirmed both operations work in the original failing linked Windows checkout. The full packaged/gameplay suite remains verified on Linux. See the [worker-route report](docs/dev/reviews/002_7a57e6d-sqlite-worker-route/REVISION-REPORT.md) and [Windows shell policy](WINDOWS_SHELL_POLICY.md).

## Distribution and project records

Archives contain the runnable entry/assets, worker/WASM, canonical schema, required licenses/notices, standalone instructions and BUILD.json version/source/dirty metadata. Sorted members with fixed timestamps/modes support reproducibility. Final release packaging uses a clean pinned main release commit, matching tag/notes and verified uploaded/downloaded asset bytes. Credentials, caches, skills and development logs are excluded.

The [CI workflow](.github/workflows/ci.yml) runs checks on main/revision pushes and pull requests with pinned official actions, Node 24 and both browsers. Fresh-cache development checks run on Linux and Windows; full packaged acceptance runs on Linux. It has Contents read only and does not publish releases. Actual hosted outcomes are recorded at release boundaries.

Accepted design and contracts are in [PROJECT](docs/dev/PROJECT.md), [ARCHITECTURE](docs/dev/ARCHITECTURE.md) and [SPEC](docs/dev/SPEC.md). See [SDD Manager usage](SDD-MANAGER.md), [AI-assisted disclosure](AI_DISCLOSURE.md) and [project instructions](AGENTS.md).
