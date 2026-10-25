# SQLite development startup correction

## Scope and provenance

The user reports `SQLite worker failed to communicate` when running `npm run dev` on Windows. This is an authorized focused correction following the completed project, not a reopening of its six phases. Starting baseline and branch-off: fbe036e10ae24da75c9363f0c84b442bdc37aa9b. Creation parent and integration target: main. Working branch: revision/001_fbe036e-sqlite-dev-startup. Existing SPEC and file-format contracts remain authoritative.

## Diagnosis and action A-001

Warm-cache Chromium SQLite checks pass (7/7). A forced fresh dependency cache instead logs `dependency optimized: sql.js` and `optimized dependencies changed. reloading` on the first Save. The main page reloads and returns to Ready rather than offering the download. The lazy worker dependency is absent from Vite's initial main-page scan. This establishes a startup defect on Linux; the exact generic worker error and native Windows behavior still require Windows execution.

Add a regression using the real Vite configuration with an isolated empty optimizer cache. Verify the first SQLite Save and first SQLite Restore independently, preserving session records and page identity without reload, using real downloads/uploads and JSON round-trip comparison. Observe failure before adding `sql.js` to explicit dependency optimization. Keep SQLite WASM loading lazy. Run Chromium and Firefox locally and add both browsers to Windows/Linux development-startup CI. Run the existing unit and packaged acceptance suites. Record actual outcomes and limits in REVISION-REPORT, then integrate the complete correction into main and publish the patch release under the standing release instruction. Stop after this correction; add no gameplay or format changes.
