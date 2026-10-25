# SQLite development-startup correction

## Provenance and scope

Campaign 001_fbe036e-sqlite-dev-startup starts at fbe036e10ae24da75c9363f0c84b442bdc37aa9b, with creation parent and integration target main. Opening commit: fb2123d1284445777eca2761699075cc951f2dbe. The [revision plan](REVISION-PLAN.md) defines action A-001. [Issue 67](https://github.com/pchemguy/SDD-Manager-Demo-Tetris-ChatGPT-Autodoc-AIO-V6/issues/67) tracks this focused repair. No original task, accepted gameplay/file contract or closed phase report is amended.

## Baseline and correction

The user reported `SQLite worker failed to communicate` under `npm run dev` on Windows. Seven existing warm-cache SQLite Chromium checks passed. A fresh-cache run instead discovered `sql.js` at the first worker operation and logged dependency re-optimization followed by a page reload. Both new first-use regression scenarios failed before the fix: Save/Restore returned to the initial Ready status rather than completing. This independently reproduces an interruption defect on Linux; it does not establish the exact Windows error event.

Vite now explicitly pre-optimizes `sql.js`, which is imported only through the lazy worker and was outside its initial page scan. No source-level worker protocol, SQLite codec, database schema or gameplay behavior changed. SQLite WASM remains lazy and local. The patch version is 1.0.1.

The new `npm run test:dev` suite creates a separate real server and empty optimizer cache for each action and browser. It exercises first SQLite Save and first SQLite Restore independently, verifies actual SQLite/JSON data, no page reload, lazy same-origin WASM and worker cleanup. Its configuration inherits the isolated Chromium/Firefox setup. CI adds this suite on Linux and Windows and checks revision pushes before integration. The Windows job explicitly uses CMD to match repository Windows policy; Linux uses Bash.

## Verification

- Before fix: both fresh-cache Chromium scenarios failed with dependency optimization and a page reload.
- After fix: four fresh-cache scenarios pass across Chromium and Firefox; no reload; exported/restored records retained.
- `npm run check`: pass, including the new test/config TypeScript.
- `npm test`: 33 files, 283 tests pass.
- `npm run package`, `python scripts/prepare-package-test.py`, `TETRIS_PACKAGE_TEST=1 TETRIS_FIREFOX_NO_CONTENT_SANDBOX=1 npm run test:browser -- --reporter=line`: 104 checks pass across Chromium and Firefox, no skips (2.2 minutes). The exact eleven-member package inventory is served and checked at root/subdirectory. Tested package records version 1.0.1, source fb2123d1284445777eca2761699075cc951f2dbe, dirty true; final clean release packaging is a separate pending step.
- Independent read-only review by review_sqlite_startup: no Critical, Important or Minor findings in the full source/config/test/document delta; no tests or edits performed by reviewer.

Local execution is Linux with Node 24.22.1, Vite 8.3.5, Playwright 1.64.1, isolated compatible Chromium and Firefox. The existing diagnosed Firefox content-sandbox override is used only locally. Native Windows checks and hosted CI are pending publication; ordinary hosted browser sandbox defaults are retained. Existing native OS-window/BFCache/picker and HTTPS execution limits remain outside this correction.

## Remaining effects

Local action A-001 is verified and source correction 37b6d2470ebd592569ba89d9e4437d1384719dd8 is published/read back. Initial hosted run 40194266092 passed the Linux startup job; its Windows shell was then made explicitly CMD before final validation. The initial run is superseded by the shell-corrected run, not final acceptance. Inspect native Windows/Linux CI, integrate the verified boundary explicitly into main, then build and publish the clean pinned 1.0.1 release and verify downloads. Campaign closure is pending those effects; this report does not claim them from planned configuration.
