# Development worker route workaround

## Scope and provenance

Campaign 002_7a57e6d-sqlite-worker-route starts at 7a57e6d3a1f94539559b096a5fcaa92cd6308ed0; opening commit fc1d54c2e7acc6fddbf2df1e14e4d8cfe14576b8. Creation parent/return target is main; working branch revision/002_7a57e6d-sqlite-worker-route. [Plan](REVISION-PLAN.md) records the user-supplied HTTP evidence and explicit **Finish workaround** selection after confirming ordinary physical checkouts work. This is a narrow development transport correction, not general Vite symlink support or a SQLite codec fix. Issue 67 stays open until verified integration/publication.

## Baseline and delivered action A-001

The user's filesystem worker entry returned HTML and failed module MIME checking at v1.0.1. Their project-relative worker entry returned HTTP 200 `text/javascript`, compiled JavaScript and correct root-relative imports. The earlier cold-cache fix did not resolve this distinct error.

The new linked-layout fixture uses a copied application with real directory links/junctions to trusted source/dependencies. It models the observed HTML response only for a filesystem worker entry; the worker, Vite compilation, dependency graph, local WASM and database remain real. Before the correction, both first-use Chromium scenarios failed with the exact displayed `Error: SQLite worker failed to communicate.` rather than successful Save/Restore. This establishes regression sensitivity without claiming reproduction of the user's exact Windows drive mapping.

Development now constructs the worker from `BASE_URL + src/leaderboard/sqlite.worker.ts?worker_file&type=module`, the route independently confirmed to work on the user's server. Production retains Vite's statically analyzed bundled worker construction. The existing injectable worker lifetime port, structured protocol, deadlines, cancellation, SQLite validation and gameplay are unchanged. Version: 1.0.2. General symlink/junction problems affecting other Vite assets remain unsupported; the reliable fallback is a physical checkout path.

## Verification

- Red: both linked-layout Chromium Save/Restore scenarios failed with the exact communication error before the source change.
- Green: all eight fresh-cache scenarios pass on Linux Chromium/Firefox, covering ordinary and linked layouts, both operations, no reload, correct SQLite/JSON data, same-origin lazy WASM and worker cleanup.
- `npm run check`: pass, including the expanded fixture TypeScript.
- `npm test`: 33 files, 283 tests pass.
- `npm run package`, exact ZIP preparation and full packaged Chromium/Firefox acceptance: 104 checks pass, no skips (2.2 minutes). The tested eleven-member archive records version 1.0.2, source fc1d54c2e7acc6fddbf2df1e14e4d8cfe14576b8 and dirty true. The production bundled-worker branch works at root and under a subdirectory. Final clean release metadata/reproducibility remain separately pending.
- Independent read-only review by review_sqlite_startup: no concrete source/test/plan findings; reviewer ran no tests and made no edits. The modeled transport response and actual-user confirmation limit were explicitly retained.
- Hosted source ceb51fa94ded90145d7cf128dbfe3296a86835b2 passed all three jobs in [CI run 40197151834](https://github.com/pchemguy/SDD-Manager-Demo-Tetris-ChatGPT-Autodoc-AIO-V6/actions/runs/40197151834): native Windows CMD and Linux Bash eight-scenario development suites, plus full Linux unit/packaged acceptance. Job/step readback confirms successful execution with normal hosted browser sandbox defaults.
- After switching to the published workaround branch and restarting development in the actual linked checkout, the user explicitly reported **Both work** for SQLite Save and Restore. This is user-reported execution in the original failing Windows setup; the agent did not directly operate that machine.

Local Node 24.22.1/Vite 8.3.5/Playwright 1.64.1 use the existing isolated browser binaries and diagnosed trusted-local Firefox content-sandbox override. Native Windows CMD/Linux Bash CI and actual-user confirmation are established for this workaround. Merged/source-bound release verification remains pending. No broad linked-checkout, native OS-window/BFCache/picker or HTTPS execution claims are added.

## Remaining effects

Action A-001 is verified, published/read back, green in native Windows/Linux CI and confirmed working by the user in the failing linked checkout. No unresolved source finding remains. Integrate the full correction into its creation parent main, then coordinate publication/verification of the clean pinned 1.0.2 patch. Main's handoff/release outcome own subsequent actual effects; this report remains an acceptance snapshot. Preserve the 1.0.1 publication outcome and prior closed campaign records. Stop after this workaround; no gameplay or file-contract expansion.
