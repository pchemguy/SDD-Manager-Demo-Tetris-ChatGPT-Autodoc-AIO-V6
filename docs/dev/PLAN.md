# Delivery plan

## Strategy

Deliver the complete [SPEC](SPEC.md) through six bounded capability increments, each integrated into the preceding usable game. [ARCHITECTURE](ARCHITECTURE.md) and [DECOMPOSITION](DECOMPOSITION.md) govern ownership. The first phase is a playable classic game, not a shell or the complete feature backlog. Later phases add coherent capabilities while preserving earlier rules and browser behavior.

| Phase | Useful integrated result | Version | Delivery milestones | Dedicated phase review milestone |
| --- | --- | --- | --- | --- |
| 1 — Classic baseline | Play, score, pause, lose and restart a classic game | 0.1.0 | 1.1–1.3 | 1.4 |
| 2 — Modern play | Seven-bag, SRS, ghost, hard drop and hold | 0.2.0 | 2.1–2.3 | 2.4 |
| 3 — Penetrator | Earn, spend and play the penetrator bonus | 0.3.0 | 3.1–3.2 | 3.3 |
| 4 — Persistent configuration | Six controls, dynamic ghost and per-setting URL/cookie persistence | 0.4.0 | 4.1–4.3 | 4.4 |
| 5 — JSON leaderboard | Session top ten with schema-validated JSON Save/Restore | 0.5.0 | 5.1–5.3 | 5.4 |
| 6 — SQLite portability | Both file formats, complete round-trip and failure behavior | 1.0.0 | 6.1–6.3 | 6.4 |

Each phase requires its predecessor's verified integration and publication. Release publication is explicitly requested after each completed implementation phase. A version is a capability claim for that phase; the full target is complete only at 1.0.0. Browser-independent rules can be built before browser provisioning, but the first browser-dependent work must proactively establish isolated, compatible Chromium/Firefox execution under [BROWSER_DEV_POLICY](../../BROWSER_DEV_POLICY.md). Missing required browser evidence blocks the affected acceptance; it does not silently remove a browser.

## Phase 1 — Classic baseline

Scope: G-01–G-06, zero-offset rotation geometry from R-01, independent uniform piece draws allowed by G-07, and S-01/S-05. Use the default interval lock policy without configuration UI. No hold, ghost, hard drop, full kicks, penetrator, leaderboard or persistence is required for this release.

| Milestone | Outcome and exit evidence |
| --- | --- |
| 1.1 — Playable falling loop | Board/geometry, movement, gravity/default locking and browser input/rendering form a runnable loop. Show a piece falling and moving; verify boundary/time traces and actual Chromium/Firefox smoke/rendering evidence. |
| 1.2 — Complete classic game | Line compaction, scoring/levels, game over, restart, pause and readable stats work end to end. Demonstrate a scored game and restart; verify top-out, pause and duplicate-completion prevention. |
| 1.3 — Browser delivery | Keyboard repeat/focus handling, static build, setup/user instructions and baseline acceptance work in both browsers. Verify packaged assets, inspected Canvas output and full classic replay with no missing essential action. |
| 1.4 — Phase review | One code-review/testing/report task assesses all classic exits, repairs blockers and supplies integration/release readiness for 0.1.0. |

This is the smallest useful classic product. Modern controls and scores portability can move independently to later phases; adding them to this phase would delay a usable baseline without satisfying an essential dependency.

## Phase 2 — Modern play

Scope: full G-07/G-08/R-01 and G-09 with always-visible ghost, enabled hard drop/hold/next, default follow/general interval locking. Keep the six control/persistence contracts and dynamic visibility UI for phase 4. Preserve phase 1 behavior except the intentional switch from independent draws to seven-bag.

| Milestone | Outcome and exit evidence |
| --- | --- |
| 2.1 — Bag and rotation | Seven-bag queue/next display and full SRS are integrated into playable movement. Verify bag boundaries, preview non-consumption, all kick transitions and regression replay. |
| 2.2 — Ghost and hard drop | One target supports visible ghost and hard drop with interval timing. Verify target equality at walls/floor/stacks, zero-distance deadline behavior and screenshots. |
| 2.3 — Hold integration | Hold once per piece, empty/swap source behavior and spawn failure work alongside drops/kicks. Demonstrate the modern game; review queue/hold/timer interactions and browser input. |
| 2.4 — Phase review | One code-review/testing/report task verifies modern cross-feature behavior and classic regressions for 0.2.0. |

Modern mechanics form a coherent player-experience increment; the unusual penetrator traversal and settings source precedence are independent risks and remain outside it.

## Phase 3 — Penetrator

Scope: P-01–P-03 with the modern baseline, including shared deepest landing, legal movement/locking, disabled active hold, bonuses and white rendering. Configuration and leaderboard remain excluded.

| Milestone | Outcome and exit evidence |
| --- | --- |
| 3.1 — Legal penetration | Deepest-valid projection, viability-checked traversal/rotation and legal-only locking integrate with ghost/drop/timers. Verify crossing occupied rows, inaccessible ordinary gaps, no-target rejection and no overwritten cells. |
| 3.2 — Earn and activate | Four-line awards, cap/spend, activation hotkey, active-hold rejection, white piece and bonus symbols provide the complete playable mechanic. Demonstrate earn→spend→lock and reject impossible activation without spending. |
| 3.3 — Phase review | One code-review/testing/report task assesses bonus/hold/projection/timing interactions, preserved modern behavior and 0.3.0 readiness. |

Two delivery milestones are retained deliberately: legal traversal is one cohesive risk and the bonus/player interface is its single consumer. Splitting a third group would create a report boundary without an independent capability.

## Phase 4 — Persistent configuration

Scope: C-01–C-04, dynamic ghost from G-09 and both alternate lock-policy combinations from G-05/S-03. The preceding game remains usable when cookies/history fail. Score history remains outside this phase.

| Milestone | Outcome and exit evidence |
| --- | --- |
| 4.1 — Runtime controls | Six controls and dynamic midline visibility operate in the current page. Verify immediate availability/visibility, preserved queue/hold state and next-spawn locking snapshots. This is a useful session-only intermediate demonstration. |
| 4.2 — Settings persistence | Per-key URL/cookie/default resolution, explicit-default writes, changed-key URL updates and independent write warnings work through real reloads. Verify mixed/omitted/duplicate/invalid sources and unavailable APIs. |
| 4.3 — Configuration integration | All setting combinations relevant to hold/penetrator/ghost/drop/timing remain coherent; UI/help explains policy capture and disabled features. Verify browser regression, control focus and URL preservation. |
| 4.4 — Phase review | One code-review/testing/report task verifies configuration precedence and gameplay interactions for 0.4.0. |

Controls and their source precedence belong together as one bounded configuration outcome; the first milestone permits feedback before persistence is layered onto it.

## Phase 5 — JSON leaderboard

Scope: L-01/L-02, JSON portions of L-04, S-04 and relevant A-07/A-08. Display top ten and manual JSON operations. Advertise JSON only until SQLite is delivered; do not show a nonfunctional SQLite promise. No automatic permanent score storage is introduced.

| Milestone | Outcome and exit evidence |
| --- | --- |
| 5.1 — Session results | Game-over insertion once, stable IDs/UTC, ranking/ties/top ten and session panel are integrated. Verify restart retention, reload clearing and no abandoned-game records. |
| 5.2 — JSON contract | Publish the normative schema asset, compile validation with strict timestamp format and provide JSON round-trip services. Verify empty/ten/unsorted records and structural/date/ID/score/count/size failures. |
| 5.3 — Manual JSON files | Save/Restore below the panel performs actual downloads/uploads with pause, atomic replacement, clear errors, cancellation and cleanup. Verify unchanged results on failure and actual bytes in both browsers. |
| 5.4 — Phase review | One code-review/testing/report task verifies session/event/file lifecycle and regressions for 0.5.0. |

Session results provide the shared data model; JSON adds useful portable files without making SQLite runtime availability a prerequisite for that increment.

## Phase 6 — SQLite portability

Scope: L-03, both formats in L-04, all remaining complete-system acceptance and preserved JSON behavior. This phase adds one format to the already-usable score workflow, rather than collecting unrelated backlog.

| Milestone | Outcome and exit evidence |
| --- | --- |
| 6.1 — SQLite encoding | A bundled lazy worker/WASM codec exports genuine SQLite with one table, version metadata and preserved values. Verify empty/ten-result database bytes, schema, integer storage and worker disposal. |
| 6.2 — Validated SQLite restore | Content detection, integrity/schema/version/storage checks, shared row validation and deadline/cancellation protect atomic restore. Verify corrupt/extra-object/type/date/count/size/timeout and stale-reply cases. |
| 6.3 — Dual-format delivery | Format choice and interchangeable JSON/SQLite files work through the actual browser UI; package all local assets and publish file/schema help. Verify JSON↔SQLite round trips, no runtime CDN and full-system regressions in both browsers. |
| 6.4 — Phase review | One code-review/testing/report task verifies complete acceptance, aggregates final unresolved/deferred TODOs and produces the final implementation report and 1.0.0 readiness. |

## Common milestone and phase exits

Every delivery milestone requires whole-capability code review, focused/integration checks, blocker repair, a committed milestone report and HANDOFF refresh. TASKS assigns a standalone review task only when the milestone has at least four delivery tasks and the phase has at least two delivery milestones; otherwise its final delivery task owns those obligations and depends on its siblings. The dedicated phase review milestone always contains exactly one phase review/testing/report task, excluded from delivery counts.

Phase review waits for all delivery milestones and their required hosted closures. It verifies cross-milestone behavior and preserved predecessor contracts, distinguishes code review from test execution, repairs required failures and records verification limits/TODOs. Final-phase review includes `docs/dev/reports/IMPLEMENTATION-REPORT.md`. Do not mark missing browser evidence or a SPEC violation as a deferred non-critical issue.

At meaningful demonstrations—classic play, modern hold/drop, penetrator earn/spend, settings reload and file round trips—the human can choose to continue, amend, simplify or stop. Demonstrations supply concrete feedback without adding approval pauses to an already authorized execution range or authorizing automatic scope changes.

After complete phase verification, explicitly integrate the phase into the established default target, verify the merged build/regressions, publish/read back, then prepare the exact version/release notes and eligible default-branch release commit/tag. Publish one GitHub release per completed phase, with reproducible static application assets, source version and release notes. Root `RELEASE-NOTES.md` supplies the final release body. Release evidence must identify the exact source/tag and packaged assets; no release is inferred from a phase checkbox.

## Risks and gates

Pin the TypeScript/build/test dependencies and compatible browser revisions during implementation, retaining the lockfile and isolated browser paths. Diagnose each browser independently before dependent browser work; use only policy-approved fallbacks. Runtime setup failure blocks the affected tasks, not browser-independent contract work.

Use exact time and constructed-board fixtures for lock/penetrator behavior before UI testing. Compile the actual JSON Schema and strict format validator, and use the actual bundled SQLite runtime for byte/schema checks; generic JSON parsing or mocked SQL does not close those exits. Bound file/worker resources and test cancellation/stale replies. Keep all SQLite/WASM assets local to the static package.

Delivery readiness depends on current SPEC conformance and physical allocation in layout. These strategy gates describe intended execution; they do not claim tests, browser provisioning, integration or releases have occurred.
