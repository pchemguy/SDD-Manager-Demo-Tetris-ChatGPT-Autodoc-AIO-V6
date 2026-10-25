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
- Independent read-only review by review_sqlite_startup: no Critical, Important or Minor findings in the full source/config/test/document delta or its explicit CMD follow-up; no tests or edits performed by reviewer.
- Hosted run [40194266092](https://github.com/pchemguy/SDD-Manager-Demo-Tetris-ChatGPT-Autodoc-AIO-V6/actions/runs/40194266092), source 37b6d2470ebd592569ba89d9e4437d1384719dd8: all three jobs completed successfully, including native Windows and Linux startup checks and Linux full packaged acceptance.
- Final shell-corrected run [40194571590](https://github.com/pchemguy/SDD-Manager-Demo-Tetris-ChatGPT-Autodoc-AIO-V6/actions/runs/40194571590), source 9aee6d3c27ccdb7a435723a024d6376810f65c45: all three jobs completed successfully. The Windows startup job explicitly uses CMD; Linux uses Bash. API readback confirms every install/test step successful with normal hosted browser sandbox defaults. The test suite defines four fresh-cache scenarios per OS, covering both actions in both browsers.

Local execution is Linux with Node 24.22.1, Vite 8.3.5, Playwright 1.64.1, isolated compatible Chromium and Firefox. The existing diagnosed Firefox content-sandbox override is used only locally. Native Windows startup execution is now verified through CI, including CMD; this does not establish Windows 10, the user's installed browser or the full Windows gameplay suite. Optional raw hosted log download returned HTTP 401 after redirect; job/step API readbacks succeeded and establish the reported hosted conclusions. Existing native OS-window/BFCache/picker and HTTPS execution limits remain outside this correction.

## Remaining effects

Action A-001 is verified locally and in native Windows/Linux CI. Both source commits are published/read back. No unresolved source finding remains. The complete correction is ready for explicit integration into its creation parent main; this finalization changes only documentation and retains the tested executable payload. Integration/publication and the separately coordinated clean pinned 1.0.1 release remain pending at this snapshot. Their actual effects belong to main's handoff and release outcome; this campaign report remains an acceptance snapshot rather than claiming future writes.
