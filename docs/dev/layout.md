# Repository layout

## Physical ownership

This layout allocates the components in [DECOMPOSITION](DECOMPOSITION.md) and increments in [PLAN](PLAN.md). Source, test, dependency and generated paths below describe intended locations; they are not a claim those files or commands already exist. The current repository contains project policies, bundled skills and development documents.

| Path | Owner and purpose | Corresponding checks |
| --- | --- | --- |
| `index.html`, `src/main.ts`, `src/styles.css` | Static entry, composition and responsive visual styles; compose actual collaborators without game-rule logic. | Static build and browser smoke/layout checks. |
| `src/game/types.ts`, `geometry.ts` | Domain data types, immutable cells, transforms, colors and ordered kick tables. | `tests/unit/game/geometry.test.ts` and rotation fixtures. |
| `src/game/board.ts` | Settled-cell predicates, bounds and simultaneous row compaction. | `tests/unit/game/board.test.ts`. |
| `src/game/landing.ts` | Shared ordinary/penetrator landing and candidate viability. | `tests/unit/game/landing.test.ts`; adversarial constructed boards. |
| `src/game/source.ts` | Independent/7-bag source with injectable entropy and preview queue. | `tests/unit/game/source.test.ts`. |
| `src/game/game.ts` | Serial transitions, game lifecycle, gravity/ground deadlines, scoring, hold and bonuses. | Focused files under `tests/unit/game/` for time, lifecycle, hold and penetrator traces. |
| `src/app/controller.ts` | Live game instance, logical time, pause reasons, event deduplication, settings wiring and atomic score/file orchestration. | `tests/unit/app/controller.test.ts` with controlled ports/clock. |
| `src/browser/input.ts` | Keyboard mapping/repeat/focus reset and play-surface input ownership. | Input-unit checks and actual browser keyboard/focus suites. |
| `src/browser/render.ts`, `panels.ts` | Canvas-only drawing and HTML controls/status/previews/leaderboard. Render snapshots; never duplicate projection rules. | Browser geometry/pixel/screenshot and DOM/control checks. |
| `src/settings/definitions.ts`, `service.ts`, `browser.ts` | Tokens/defaults, pure per-key resolution and browser cookie/history adapters. | `tests/unit/settings/` and browser reload/precedence cases. |
| `src/leaderboard/validation.ts`, `store.ts` | Canonical record validation, ranking/top ten and page-lifetime storage. | `tests/unit/leaderboard/validation.test.ts`, `store.test.ts`. |
| `src/leaderboard/json.ts` | Schema-first JSON codec and strict timestamp format registration. Imports the canonical schema contract. | `tests/unit/leaderboard/json.test.ts` and malformed result fixtures. |
| `src/leaderboard/sqlite.ts`, `sqlite.worker.ts` | SQLite encode/decode/schema/integrity logic and bounded worker entry. | Real database unit fixtures, browser worker/timeout/resource checks. |
| `src/leaderboard/files.ts`, `src/browser/files.ts` | Format detection/limits/codec lifecycle and browser picker/download adapter respectively. | Codec dispatch/cancellation/atomicity checks and browser byte round trips. |
| `docs/dev/spec/LEADERBOARD-SCHEMA.json` | Canonical versioned JSON Schema, shared by codec compilation and published-schema generation. | Schema compilation, semantic invalid-date corpus and generated-asset byte comparison. |
| `scripts/copy-schema.mjs` | Generates `public/leaderboard.schema.json` from the canonical schema for local development/build. This copy is generated, ignored and never independently edited. | Dev/build asset existence and exact schema byte identity. |
| `package.json`, lockfile, TypeScript/Vite/Vitest/Playwright configuration | Reproducible dependencies, type/build/unit/browser entry points and local worker/WASM asset bundling. | Clean dependency install and package build/check scripts once implemented. |
| `.github/workflows/ci.yml`, `scripts/` | Bounded verification/packaging commands and isolated browser setup used locally/CI. No implicit release dispatch. | Same pinned runner, declared modes and static package inspection. |

Logical component boundaries do not require one class or a separate interface file. Keep game types near the game domain and result/settings contracts near their owners. Browser adapters may import pure definitions; the game domain must not import DOM, browser storage, controller, codecs or SQL runtime. The controller imports its concrete collaborators at composition time or receives narrow ports for controlled checks.

## Tests, fixtures and evidence

Use `tests/unit/game/`, `tests/unit/app/`, `tests/unit/settings/` and `tests/unit/leaderboard/` for deterministic behavior. Use `tests/browser/` for runnable-application suites covering classic, modern, penetrator, configuration, session results and each file format. Browser tests operate through the actual dev/preview server and dedicated profiles/binaries, not personal sessions.

`tests/fixtures/` holds small explicitly owned board/result/corrupt-file fixtures; generated database fixtures must have reproducible construction notes or a scoped generator. Use actual SQLite bytes where schema/integrity matters. A fake codec response can test controller races but cannot prove format compatibility. Test helpers own controlled entropy, clocks and ID/time sources, without exporting test hooks into normal gameplay UI.

Keep generated `node_modules/`, `dist/`, browser downloads/state, test results, screenshots and Playwright reports untracked. Use a dedicated absolute browser cache resolved for this project/job, consistently assigned to setup and every runner. Add appropriate ignore rules when these artifacts are introduced. Preserve existing repository exclusions, including `*.tkn`; never package credentials, local browser state, bundled development skills or provenance logs in the static application.

Permanent verification summaries use `docs/dev/reports/phases/<phase-id>/<milestone-id>.md`, `docs/dev/reports/phases/<phase-id>/PHASE-REPORT.md` and final `docs/dev/reports/IMPLEMENTATION-REPORT.md`. Reports carry actual code review, test/environment evidence, limits and TODOs; transient traces/screenshots remain generated artifacts unless an explicitly selected durable example is needed.

## Documentation and packaging

`README.md` provides truthful product status, validated commands and links. `docs/user/CONTROLS.md`, `CONFIGURATION.md` and `LEADERBOARD.md` own player instructions as their capabilities are delivered. Root AGENTS remains the instruction/navigation entry; HANDOFF and preparation records retain workflow state. Existing policy files and bundled `.agents/` material remain in their current locations.

The normative schema under `docs/dev/spec/` is a deliberate shared-contract exception: import/copy that one small artifact into the build; never ship the development document tree. The generated public schema and bundled sql.js/WASM files must resolve under the configured static deployment base, including a subdirectory. `dist/` is the reproducible static product; version metadata comes from the package version. Root `RELEASE-NOTES.md` holds final release notes; package archives contain runnable static assets and required notices, not caches or project credentials.

The initial executable task establishes actual supported scripts and dependency versions. Update README/AGENTS only with commands verified on the actual execution host; Windows uses the existing CMD policy. This allocation does not claim a build, browser install, CI run or release exists.
