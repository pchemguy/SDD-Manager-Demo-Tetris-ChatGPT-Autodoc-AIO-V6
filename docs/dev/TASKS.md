# Implementation tasks

## Execution contract

The [PLAN](PLAN.md) owns phase/milestone outcomes, [layout](layout.md) physical ownership and [SPEC](SPEC.md) precise behavior. This is the single executable task list; all implementation work is initially unchecked. Accepted document inputs do not establish an implementation baseline until their required published integration is complete.

For each delivery task, use meaningful test-first evidence for new rules/behavior, implement the bounded outcome, update affected player/module documentation, run relevant checks and repair failures before completion. Include the result, required evidence and initial task checkbox in one owning commit; publish/read back before dependent work and reconcile its hosted issue. Never claim a browser, schema or SQLite check from a mock alone.

Each delivery milestone has three delivery tasks. Its final task depends on both siblings and includes whole-milestone code review, relevant tests/regressions, blocker repairs, a milestone report with a TODO section and HANDOFF refresh in that same completion commit. No standalone delivery-milestone review task is required at this count. Each phase has one dedicated review task after its delivery milestones; code review and test execution are separate evidence.

Phase entry requires the predecessor review, hosted milestone closures and verified published integration; first entry also requires the accepted preparation baseline and eligible-phase projection. Phase completion is followed by explicit integration, merged-state checks/publication and the requested versioned GitHub release before any authorized next phase. Review tasks prepare exact source/version/notes/package evidence; a provider release is coordinated after integration. A bounded execution request stops at its selected range.

## Phase 1 — Classic baseline

- [x] Phase 1 — Classic baseline
    - [x] Milestone 1.1 — Playable falling loop
        - [x] T-001 — Establish classic geometry and board rules
            Completion evidence: RED: npm test observed four intended geometry/collision failures. GREEN: npm test passed 5/5; npm run check passed. Pinned dependencies installed from registry with a lockfile; board rows, spawn cells, pivot/O behavior, hidden bounds and collisions verified. Browser/build acceptance remains T-003 work.
            Scope: package/toolchain setup; src/game/types.ts, geometry.ts, board.ts; unit fixtures.
            Depends on: none. Contract: G-01, R-01 zero-offset subset.
            Evidence: Typecheck and deterministic bounds/spawn/rotation/board fixtures; no full kicks or modern features.
        - [x] T-002 — Implement movement gravity and interval locking
            Completion evidence: RED: four intended clock/movement assertions failed against the initial Game placeholder. GREEN: npm test passed 11/11 and npm run check passed. Verified full grounding interval, grounded-move preservation, unground/reground resets, floor/wall rejection, first-obstruction landing and controlled independent source; snapshots are detached. Also verified clean npm ci from the committed lockfile before this task.
            Scope: src/game/game.ts, landing.ts, source.ts; time/command tests.
            Depends on: T-001. Contract: G-01, G-04/G-05 default interval, G-07 independent source, S-01.
            Evidence: Exact grounding deadline, failed moves, legal movement, ordinary landing and seeded source traces.
        - [x] T-003 — Connect the playable browser loop
            Completion evidence: RED: two Controller assertions and the persisted-page lifecycle regression failed before fixes. GREEN: 17 unit tests, TypeScript/Vite build, and 10 actual app browser tests passed (5 Chromium/5 Firefox); screenshot inspected. Repeated isolated preflight passed after official download fallbacks and diagnosed Firefox process-local override. Independent milestone review rechecked the repaired lifecycle bug; report 1.1 and HANDOFF included. Native Back and modeled persisted-handler evidence are explicitly distinguished.
            Scope: src/main.ts; app/controller.ts; browser/input.ts, render.ts; isolated Playwright setup.
            Depends on: T-001, T-002. Contract: G-01/G-03 initial keys, S-01/S-05, A-01 playable subset.
            Evidence: Proactively pin/provision and repeatedly exercise isolated Chromium/Firefox before browser-dependent checks; verify falling/moving/rotating board and inspected rendering.
            Milestone exit: review the whole 1.1 capability and dependencies; run focused/browser/regression checks as applicable; fix blockers; include `docs/dev/reports/phases/1/1.1.md` and refreshed HANDOFF with this task’s result and initial completion. TODO section: None or evidence-backed eligible deferrals.
    - [x] Milestone 1.2 — Complete classic game
        - [x] T-004 — Add simultaneous line clearing scoring and levels
            Completion evidence: RED: three intended compaction/scoring assertions failed before implementation. GREEN: 25 unit tests and TypeScript/Vite build passed. Verified simultaneous immutable compaction, 1–4 line awards at pre-clear level, threshold level/speed change for the next piece, successful-only soft-drop points, zero-line lock and safe score saturation. Browser scoring presentation remains T-006 work.
            Scope: src/game/board.ts, game.ts; line/score unit fixtures.
            Depends on: T-003. Contract: G-06.
            Evidence: One-to-four-line compaction, level-before-clear scoring, speed changes and safe score saturation.
        - [x] T-005 — Complete game lifecycle and pause transitions
            Completion evidence: RED: three intended pause/completion assertions failed. GREEN: 29 unit tests and TypeScript/Vite build passed. Composable pause reasons freeze logical deadlines and reject commands; resume preserves remaining time. Spawn/hidden-lock game over queues one event with an instance ID; controller emits once, restart resets game/user pause and excludes abandonment. UI lifecycle controls are T-006 work.
            Scope: src/game/game.ts; app/controller.ts; lifecycle/time tests.
            Depends on: T-004. Contract: G-02, G-05, S-01, A-01/A-03.
            Evidence: Spawn/top-out, one completion event, restart preservation boundaries and frozen/restored logical deadlines.
        - [x] T-006 — Present classic stats and lifecycle controls
            Completion evidence: RED: missing-stats UI test failed before UI implementation; Enter regression failed with live score reset before repair. GREEN: 30 unit tests, TypeScript/Vite build and 16 browser checks passed (8 each). Native controls and controlled-clock browser flows verify a scored line clear, stats, pause/resume, game over/restart and Enter/P/Escape guards. Independent milestone review rechecked fixes; report 1.2 and HANDOFF included.
            Scope: browser/panels.ts; controller/render composition; browser classic suite.
            Depends on: T-004, T-005. Contract: G-01–G-06, S-05, A-01.
            Evidence: Play a scored game, pause/resume, lose and restart through real controls in both browsers; stats match domain.
            Milestone exit: review the whole 1.2 capability and dependencies; run focused/browser/regression checks as applicable; fix blockers; include `docs/dev/reports/phases/1/1.2.md` and refreshed HANDOFF with this task’s result and initial completion. TODO section: None or evidence-backed eligible deferrals.
    - [x] Milestone 1.3 — Browser delivery
        - [x] T-007 — Implement controlled key repeat and focus pause
            Completion evidence: RED: native held-key test failed at the first 150 ms repeat boundary. GREEN: 30 unit tests, TypeScript/Vite build and 28 supported browser checks passed (14 each). Verified 150/50 repeat, latest-direction/fresh-delay behavior, held-state cleanup, native DOM control/key ownership and modeled blur/visibility/user-pause composition. Independent review found no Critical/Important code issue. Controlled probes disproved an extra native tab-focus test premise in headless sessions; removed that invalid assertion and documented that OS-window transitions are not established, rather than claiming models are native evidence.
            Scope: browser/input.ts; app/controller.ts; focus/repeat tests.
            Depends on: T-006. Contract: G-03, S-01/S-05.
            Evidence: 150/50 ms repeat, competing horizontal keys, one-shot repeat suppression, form focus, blur/visibility and user-pause composition.
        - [x] T-008 — Package and document the playable baseline
            Completion evidence: RED: initial archive failed the required playable-entry/license inventory check. GREEN: npm run package built the static app and inspected a 7-member ZIP; two package builds were byte-identical with SHA-256 745258ea176b1ade79c208b2f8eb52b1bf1f47f03a55b92642b229a5cfba3b92. Verified CRC, unique safe names, relative asset references, license/version/source/dirty metadata, checksum and credential exclusions. Workflow YAML parsed and official v7 action commits pinned; hosted CI and clean tagged release packaging remain pending.
            Scope: build/CI configuration; package lock/version; README, docs/user/CONTROLS.md.
            Depends on: T-007. Contract: S-05, Phase 1 delivery/release requirements.
            Evidence: Reproducible static build and validated setup/check commands; baseline version 0.1.0 and truthful controls, assets and notices.
        - [x] T-009 — Verify classic browser acceptance and repair blockers
            Completion evidence: Thirty unit tests/check/build and 30 actual packaged-server browser checks passed (15 Chromium/15 Firefox). Verified minimum 1024x768 essential bounds and inspected Firefox screenshot; static asset responses succeeded. Independent whole-milestone/phase code review found no Critical/Important issue. CI now runs the extracted package; YAML parsed. Report 1.3 and HANDOFF retain native OS-focus, Windows and hosted-CI evidence limits.
            Scope: tests/browser/classic suites and rendering fixtures; affected baseline owners.
            Depends on: T-007, T-008. Contract: A-01/A-03/A-09 baseline, Phase 1 exits.
            Evidence: Actual packaged/server path in Chromium/Firefox, Canvas screenshot inspection, keyboard/lifecycle/time regressions and no missing essential classic action.
            Milestone exit: review the whole 1.3 capability and dependencies; run focused/browser/regression checks as applicable; fix blockers; include `docs/dev/reports/phases/1/1.3.md` and refreshed HANDOFF with this task’s result and initial completion. TODO section: None or evidence-backed eligible deferrals.
    - [x] Milestone 1.4 — Phase review
        - [x] T-010 — Review test and report phase 1
            Completion evidence: Independent read-only phase code review and owner cross-milestone inspection found no Critical/Important blockers. Classic exits pass: 30 unit tests/check/build and 30 packaged Chromium/Firefox checks, inspected screenshot. Actual parent-diff audit verified T001-T009 single-task result/evidence/initial checkbox commits and folded reports. Phase report/HANDOFF record source, release readiness, limits and pending integration/provider effects.
            Scope: complete phase code and integration boundaries, required acceptance/regressions, blocker repairs, report and release readiness for 0.1.0.
            Depends on: T-009; all phase 1 delivery milestones completed and closed, including their folded review/report obligations.
            Evidence: independently assess code and executed checks, confirm phase exits and preserved predecessor behavior, reconcile findings/TODOs and exact version/package/release-note source; include `docs/dev/reports/phases/1/PHASE-REPORT.md` and refreshed HANDOFF in this task’s completion commit.

## Phase 2 — Modern play

- [x] Phase 2 — Modern play
    - [x] Milestone 2.1 — Bag and rotation
        - [x] T-011 — Implement seven-bag generation and queue semantics
            Completion evidence: RED: two new queue/permutation tests failed with missing peek. GREEN: 35 unit tests/check and 30 actual Chromium/Firefox regressions passed. Twenty deterministic bags contain every kind once, preview does not consume, exact boundary refill uses six draws, invalid entropy rejects. Updated the classic line-clear replay from impossible repeated I pieces to legal I/J/L; source switch is intentional. HANDOFF records verified predecessor release/CI and phase projection.
            Scope: src/game/source.ts; bag/queue fixtures.
            Depends on: T-010. Contract: G-07.
            Evidence: Every seeded bag contains seven kinds once, boundary draws and preview do not corrupt consumption.
        - [x] T-012 — Implement full SRS transformations and kicks
            Completion evidence: RED: all 16 transition cases plus the floor-kick fixture failed before SRS. GREEN: 52 unit tests/check and production build pass. Ordered candidates match the normative tables, actual Game rotation selects the first legal wall/floor/hidden/stack target, and all-kicks rejection preserves board/piece/deadline. Corrected an overstrong empty-board fixture premise by adding real blocking-cell variants for transitions that need a stack to exercise kicks. O/pivot geometry regressions remain green.
            Scope: src/game/geometry.ts, game.ts; rotation fixtures.
            Depends on: T-011. Contract: R-01, G-05.
            Evidence: All eight transitions in each ordered table, wall/floor/stack rejection, O invariance, hidden bounds and unchanged timer on rejected rotation.
        - [x] T-013 — Integrate next preview and modern piece selection
            Completion evidence: RED: snapshot next assertion and both-browser missing-preview checks failed before wiring. GREEN: 55 unit tests/check/build, 32 Chromium/Firefox browser checks and final two-browser minimum-viewport CSS recheck pass. Native I wall kick and next advancement verified; playing preview screenshot inspected. Scoped old canvas locators to board after adding preview. Independent milestone review rechecked I-pivot/four-cycle coverage and found no Critical/Important blocker; report 2.1/HANDOFF included.
            Scope: browser/panels.ts; game/controller source wiring; browser tests.
            Depends on: T-011, T-012. Contract: G-07, R-01, A-02.
            Evidence: Visible next matches next spawn, classic replay remains usable, full SRS works in the actual game.
            Milestone exit: review the whole 2.1 capability and dependencies; run focused/browser/regression checks as applicable; fix blockers; include `docs/dev/reports/phases/2/2.1.md` and refreshed HANDOFF with this task’s result and initial completion. TODO section: None or evidence-backed eligible deferrals.
    - [x] Milestone 2.2 — Ghost and hard drop
        - [x] T-014 — Unify ordinary landing projection
            Completion evidence: RED: the hidden first-obstruction fixture returned a non-visible target. GREEN: 59 unit tests and TypeScript check pass. Shared ordinary projection now rejects hidden/invalid targets, stops at overhangs rather than lower legal gaps, preserves board data and lands every kind/orientation exactly at the bottom boundary. Grounding consumes this projection; lifecycle/time/SRS/source regressions remain green.
            Scope: src/game/landing.ts; constructed-board unit fixtures.
            Depends on: T-013. Contract: G-09, S-02.
            Evidence: Floor/wall/overhang/stack targets use first obstruction and never overlap settled cells.
        - [x] T-015 — Implement hard drop with captured lock timing
            Completion evidence: RED: all four hard-drop contract tests failed on the absent action. GREEN: 63 unit tests and TypeScript check pass. Hard drop uses the shared first-obstruction target, awards two points per traveled row with saturation, waits a full grounding interval, preserves zero-distance clocks/score, ignores no-target states and honors a due lock before a same-time subsequent drop. Browser action and ghost rendering remain T-016.
            Scope: src/game/game.ts; clock/drop tests.
            Depends on: T-014. Contract: G-05/G-09 default follow, S-01/S-02.
            Evidence: Score traveled rows, position at shared target, preserve zero-distance deadline and obey interval-policy boundary ties.
        - [x] T-016 — Render ghost and wire the hard-drop action
            Completion evidence: RED: missing-ghost snapshot/pixel assertions and hidden-row grounding regression failed. GREEN: 65 unit tests, TypeScript/Vite build and 34 actual Chromium/Firefox checks pass. Floor/stack ghost and hard-drop pixel equality, delayed source advancement and held Space across spawning verified; Firefox ghost screenshot inspected. Independent milestone review found R2.2-01, rechecked its timing repair, and found no remaining Critical/Important blocker. Report 2.2/HANDOFF and controls updated.
            Scope: browser/render.ts, input.ts; game/controller snapshots; browser tests.
            Depends on: T-014, T-015. Contract: G-09 always-show subset, A-02/A-03.
            Evidence: Ghost/drop positions match at floor/stacks, active piece remains legible, Space acts once and prior controls remain usable.
            Milestone exit: review the whole 2.2 capability and dependencies; run focused/browser/regression checks as applicable; fix blockers; include `docs/dev/reports/phases/2/2.2.md` and refreshed HANDOFF with this task’s result and initial completion. TODO section: None or evidence-backed eligible deferrals.
    - [x] Milestone 2.3 — Hold integration
        - [x] T-017 — Implement once-per-piece hold and source exchange
            Completion evidence: RED: all five hold fixtures failed on the missing action. GREEN: 70 unit tests and TypeScript check pass. Verified empty versus nonempty queue consumption, once-per-lock guard, fresh position/orientation/gravity/deadline, hold during grounding delay, blocked replacement game over without board mutation, and fresh-game reset. Centralized replacement timing for constructor/lock/hold; existing drop/ghost/hidden-row/SRS regressions pass. UI/key wiring remains T-018.
            Scope: src/game/game.ts; hold/source/time tests.
            Depends on: T-016. Contract: G-08.
            Evidence: Empty versus swap queue consumption, used flag, fresh orientation/timing and blocked replacement game over.
        - [x] T-018 — Expose hold state and keyboard controls
            Completion evidence: RED: actual Chromium hold UI check failed on the absent Held panel. GREEN: 70 unit tests, TypeScript/Vite build and four focused browser checks pass (hold plus 1024x768 in each browser). Native C and both Shift keys enforce once-per-lock exchange, preserve next during nonempty swap, reject paused commands and reset on restart. Shared colored preview helper presents domain-selected kinds. Independent read-only interaction review found no Critical/Important issue; full phase regressions/package remain T-019.
            Scope: browser/panels.ts, input.ts; controller snapshots.
            Depends on: T-017. Contract: G-08, A-02.
            Evidence: C/Shift swaps once, displays held kind and does not consume next during a nonempty exchange.
        - [x] T-019 — Verify modern interactions and document controls
            Completion evidence: Modern play verified at version 0.2.0: 70 unit tests/check/build; 38 fresh-package Playwright checks (36 page interactions +2 HTTP identity checks) passed. Strengthened exact-ZIP served-byte checks passed after preparation repairs; discarded stale-artifact failures are documented. Native hold repeat across spawn and paused-available rejection strengthened; Firefox held/next/ghost screenshot inspected. Independent milestone/phase interaction and final preparer/docs reviews found no Critical/Important issue. Report 2.3/HANDOFF included; clean release packaging remains pending.
            Scope: tests/browser/modern suites; docs/user/CONTROLS.md; affected modern owners.
            Depends on: T-017, T-018. Contract: G-07–G-09, R-01, A-02/A-03.
            Evidence: Bag/hold/kick/drop/timer combinations in both browsers, screenshots and classic regression; version 0.2.0 packaging metadata.
            Milestone exit: review the whole 2.3 capability and dependencies; run focused/browser/regression checks as applicable; fix blockers; include `docs/dev/reports/phases/2/2.3.md` and refreshed HANDOFF with this task’s result and initial completion. TODO section: None or evidence-backed eligible deferrals.
    - [x] Milestone 2.4 — Phase review
        - [x] T-020 — Review test and report phase 2
            Completion evidence: Dedicated phase code/interaction and final packaging review found no unresolved Critical/Important issue; R2.2-01 repair rechecked. Clean T019 source passed 70 unit tests/check/build/package and all 38 packaged Playwright checks including exact member-byte HTTP identity. Modern and classic exits pass; actual T011-T019 parent-diff task audit and closed phase1 record preservation pass. Phase report/HANDOFF distinguish candidate source from pending merged/release source and preserve evidence limits.
            Scope: complete phase code and integration boundaries, required acceptance/regressions, blocker repairs, report and release readiness for 0.2.0.
            Depends on: T-019; all phase 2 delivery milestones completed and closed, including their folded review/report obligations.
            Evidence: independently assess code and executed checks, confirm phase exits and preserved predecessor behavior, reconcile findings/TODOs and exact version/package/release-note source; include `docs/dev/reports/phases/2/PHASE-REPORT.md` and refreshed HANDOFF in this task’s completion commit.

## Phase 3 — Penetrator

- [x] Phase 3 — Penetrator
    - [x] Milestone 3.1 — Legal penetration
        - [x] T-021 — Implement deepest legal penetrator projection
            Completion evidence: RED: four new penetrator projection fixtures failed against ordinary-only landing. GREEN: 75 unit tests and TypeScript check pass. Shared service enumerates deepest visible non-overlapping target below obstructions, permits transient overlap, handles isolated gaps/no-target/current bounds, preserves occupied cells and matches independent bottom-up enumeration across 280 seeded kind/orientation cases. Ordinary/time/SRS/hold regressions remain green; predecessor release and phase projection recorded in HANDOFF.
            Scope: src/game/landing.ts; adversarial board fixtures.
            Depends on: T-020. Contract: P-02, S-02.
            Evidence: Enumerated deepest targets below blockers, intermediate overlap, board boundaries and no-target cases.
        - [x] T-022 — Implement viability-checked penetrator transitions
            Completion evidence: RED: six viability/activation domain tests failed on the absent transition. GREEN: 81 unit tests and TypeScript check pass. Penetrator transforms/kicks require a deepest legal target, cross occupied cells without mutation, reject impossible lateral candidates, preserve/cancel grounding correctly and retain the gravity schedule. Activation validates before spending, repeats reject and active hold cannot transfer the ability. A bounded initial-bonus injection supports domain fixtures; normal games still start at zero and player awards/hotkey/presentation remain T024-T026. Shared projection selection keeps consumers coherent.
            Scope: src/game/game.ts; geometry/landing collaborators; domain fixtures.
            Depends on: T-021. Contract: P-01/P-02, G-05, R-01.
            Evidence: Traversal/ordered kicks retain a legal target; transient overlap never locks; activation grounding preserves or cancels deadlines correctly.
        - [x] T-023 — Integrate penetrator ghost drop and legal locking
            Completion evidence: RED: three integration assertions failed before exposing activation in snapshots. GREEN: 84 unit tests/check/build/package and 38 packaged normal-player/HTTP checks pass. Exact traces verify ghost/deepest-drop equality, gravity across occupied rows into an isolated gap, whole-interval legal lock, four new cells with all old cells preserved, activation reset and detached overlap snapshots. Independent complete-milestone review/recheck found no Critical/Important issue. Report3.1/HANDOFF distinguish domain ability evidence from upcoming earned-bonus/B/white browser acceptance.
            Scope: src/game/game.ts, landing.ts; renderer snapshots; integration fixtures.
            Depends on: T-021, T-022. Contract: P-02, G-09, S-02, A-05 legal-motion subset.
            Evidence: Ghost/drop deepest equality, crossing occupied rows, ordinary-versus-penetrator distinction, no overwritten cells and legal-only final lock.
            Milestone exit: review the whole 3.1 capability and dependencies; run focused/browser/regression checks as applicable; fix blockers; include `docs/dev/reports/phases/3/3.1.md` and refreshed HANDOFF with this task’s result and initial completion. TODO section: None or evidence-backed eligible deferrals.
    - [x] Milestone 3.2 — Earn and activate
        - [x] T-024 — Award and cap penetrator bonuses
            Completion evidence: RED: four award/future-activation assertions failed before four-line awards. GREEN: 94 unit tests and TypeScript check pass. Exactly four simultaneous lines add one bonus, cap at three, zero-to-three line clears add none, and an activated clear ends the old activation before awarding a future use. Fresh games reset zero; bounded fixture funding rejects invalid values. Existing legal traversal/drop/hold/timing regressions pass.
            Scope: src/game/game.ts; scoring/bonus fixtures.
            Depends on: T-023. Contract: P-03.
            Evidence: Four-line clears award exactly one, zero-to-three cap, penetrator clear awards future bonus and new game resets.
        - [x] T-025 — Wire activation spending and active hold rejection
            Completion evidence: RED: three activation-routing assertions failed before the Controller route. GREEN: 98 unit tests and TypeScript/Vite build pass. B maps through the one-shot gameplay input path; Controller tests verify one spend with extra funding, active hold rejection/source preservation, paused activation rejection while funded, no-target preservation and due four-line lock/award before same-time activation of the new piece. Native earned-bonus/B/white acceptance remains T-026; domain guards are shared with prior viability work.
            Scope: src/game/game.ts; browser/input.ts; activation/hold fixtures.
            Depends on: T-024. Contract: P-01/P-03, G-08.
            Evidence: B spends once only after viable activation, rejects impossible/repeated activation without spending, and blocks hold while active.
        - [x] T-026 — Present and verify the complete bonus mechanic
            Completion evidence: RED: real Chromium bonus-panel assertion failed before presentation. GREEN: 99 unit tests/check/build, 40 packaged Playwright checks and final two-browser package-byte recheck pass. A generated/production-domain-validated seven-bag replay naturally earns/spends/locks in both browsers, verifies four white cells/white deepest ghost, active hold ban, indicator updates and preserved occupied bridge. Firefox screenshot inspected; min viewport/regressions pass. Version0.3.0, player/accessibility/package help and report3.2/HANDOFF complete. Independent milestone/phase review and docs recheck found no Critical/Important issue.
            Scope: browser/render.ts, panels.ts; browser penetrator suite; player help.
            Depends on: T-024, T-025. Contract: P-01–P-03, A-05.
            Evidence: Entirely white active piece, nonwhite regular colors, one symbol per bonus, earn→spend→lock demonstration, modern regressions and 0.3.0 metadata.
            Milestone exit: review the whole 3.2 capability and dependencies; run focused/browser/regression checks as applicable; fix blockers; include `docs/dev/reports/phases/3/3.2.md` and refreshed HANDOFF with this task’s result and initial completion. TODO section: None or evidence-backed eligible deferrals.
    - [x] Milestone 3.3 — Phase review
        - [x] T-027 — Review test and report phase 3
            Completion evidence: Dedicated owner/independent full-phase code and interaction review found no unresolved Critical/Important issue. Clean T026 source passed 99 unit tests/check/build/package and40 packaged Playwright checks, including natural native earn-spend-penetrate-lock and exact member bytes; screenshot inspected. Actual T021-T026 owning-commit audit and closed-record preservation passed. Phase report/HANDOFF distinguish clean candidate from pending main release source and record environment limits/integration gates.
            Scope: complete phase code and integration boundaries, required acceptance/regressions, blocker repairs, report and release readiness for 0.3.0.
            Depends on: T-026; all phase 3 delivery milestones completed and closed, including their folded review/report obligations.
            Evidence: independently assess code and executed checks, confirm phase exits and preserved predecessor behavior, reconcile findings/TODOs and exact version/package/release-note source; include `docs/dev/reports/phases/3/PHASE-REPORT.md` and refreshed HANDOFF in this task’s completion commit.

## Phase 4 — Persistent configuration

- [ ] Phase 4 — Persistent configuration
    - [x] Milestone 4.1 — Runtime controls
        - [x] T-028 — Define runtime settings and alternate lock policies
            Completion evidence: RED: nine runtime-policy assertions failed plus the absent definitions module. GREEN: 111 unit tests, TypeScript/Vite build pass. Exact tokens/defaults and strict value checks, failed Down/gravity, follow versus immediate (including zero travel), captured old deadline/policies, hold replacement capture, live availability with preserved hold/source and pre-start Controller settings are verified. Due lock precedes new-piece immediate drop. HANDOFF records verified 0.3.0 release/CI and phase4 hosted readiness.
            Scope: src/settings/definitions.ts; game/controller policy capture; unit tests.
            Depends on: T-027. Contract: C-01, G-05, S-03.
            Evidence: Exact tokens/defaults, failed-down and immediate hard-drop modes, same-time boundaries and next-spawn snapshots.
        - [x] T-029 — Connect six live configuration controls
            Completion evidence: RED: both actual Chromium control scenarios failed on absent labeled selects. GREEN: 111 unit tests/build and six focused Chromium/Firefox checks (live controls, ready policy capture and minimum viewport) pass. All six native controls update memory, hide/disable immediately while preserving queue/hold-used state, retain current locking policy and apply selected policies at next/hold spawn. Strict tokens/native focus ownership, dynamic whole-piece condition and listener disposal included. Independent read-only core review found no Critical/Important issue; boundary visibility/complete regressions remain T-030.
            Scope: browser/panels.ts; controller/settings in-memory wiring.
            Depends on: T-028. Contract: C-01, G-07–G-09, S-03.
            Evidence: All controls work without persistence, hide/disable relevant features immediately and preserve source/hold state.
        - [x] T-030 — Implement dynamic ghost and verify runtime settings
            Completion evidence: Extracted existing whole-piece visibility into a pure contract boundary; its three initial helper assertions failed before extraction. GREEN:114 unit tests/check/build/package and all48 packaged checks pass. Exact-midline I cells, straddling/upper/lower/null modes verified. Native browsers build a real straddling L target, hide/show and move lower to reveal it; native select keys preserve board ownership and ghost survives hardDropoff. Firefox screenshot inspected. Independent whole-milestone review/recheck found no Critical/Important issue; report4.1/HANDOFF included.
            Scope: game/landing snapshots; browser/render.ts; runtime-setting suites.
            Depends on: T-028, T-029. Contract: G-09, C-01, A-04.
            Evidence: Hide straddling/upper ghost, show all-lower ghost; test switching/disabled hold/drop/next and captured policies in playable game.
            Milestone exit: review the whole 4.1 capability and dependencies; run focused/browser/regression checks as applicable; fix blockers; include `docs/dev/reports/phases/4/4.1.md` and refreshed HANDOFF with this task’s result and initial completion. TODO section: None or evidence-backed eligible deferrals.
    - [ ] Milestone 4.2 — Settings persistence
        - [ ] T-031 — Resolve URL cookie and default per setting
            Scope: src/settings/service.ts; synthetic source fixtures.
            Depends on: T-030. Contract: C-02.
            Evidence: All six keys, mixed/omitted/default URL cases, duplicate/invalid tokens/cookies and independent fallback.
        - [ ] T-032 — Implement independent cookie and URL writes
            Scope: src/settings/browser.ts, service.ts; adapter failure tests.
            Depends on: T-031. Contract: C-03/C-04.
            Evidence: Exact cookie flags, valid explicit-default writes, no omitted/default overwrite, changed-key replaceState and unrelated URL preservation.
        - [ ] T-033 — Integrate startup reload and persistence feedback
            Scope: src/main.ts; controller/panels; browser configuration suite.
            Depends on: T-031, T-032. Contract: C-01–C-04, A-06.
            Evidence: Resolve before first spawn; actual reload/cookies/query, separate write failures, visible warnings and working session controls.
            Milestone exit: review the whole 4.2 capability and dependencies; run focused/browser/regression checks as applicable; fix blockers; include `docs/dev/reports/phases/4/4.2.md` and refreshed HANDOFF with this task’s result and initial completion. TODO section: None or evidence-backed eligible deferrals.
    - [ ] Milestone 4.3 — Configuration integration
        - [ ] T-034 — Verify policies across hold penetrator and drop
            Scope: domain/controller integration fixtures; affected rule owners.
            Depends on: T-033. Contract: G-05/G-08/G-09, P-01/P-02, S-03.
            Evidence: Mid-piece policy changes, hold-spawn capture, active-penetrator guard, ghost with hard drop off and no timer/source reset.
        - [ ] T-035 — Explain and expose configuration state clearly
            Scope: browser/panels.ts, styles; docs/user/CONFIGURATION.md.
            Depends on: T-034. Contract: C-01/C-04, S-05.
            Evidence: Labeled/native controls, next-piece policy note, disabled-feature explanations and visible nonblocking persistence status.
        - [ ] T-036 — Verify persistent configuration in both browsers
            Scope: tests/browser/configuration suites; packaged app/README/version.
            Depends on: T-034, T-035. Contract: A-04/A-06/A-09, Phase 4 exits.
            Evidence: All six source/write/reload paths, focus, fragment/unrelated query retention and classic/modern/penetrator regression; version 0.4.0 metadata.
            Milestone exit: review the whole 4.3 capability and dependencies; run focused/browser/regression checks as applicable; fix blockers; include `docs/dev/reports/phases/4/4.3.md` and refreshed HANDOFF with this task’s result and initial completion. TODO section: None or evidence-backed eligible deferrals.
    - [ ] Milestone 4.4 — Phase review
        - [ ] T-037 — Review test and report phase 4
            Scope: complete phase code and integration boundaries, required acceptance/regressions, blocker repairs, report and release readiness for 0.4.0.
            Depends on: T-036; all phase 4 delivery milestones completed and closed, including their folded review/report obligations.
            Evidence: independently assess code and executed checks, confirm phase exits and preserved predecessor behavior, reconcile findings/TODOs and exact version/package/release-note source; include `docs/dev/reports/phases/4/PHASE-REPORT.md` and refreshed HANDOFF in this task’s completion commit.

## Phase 5 — JSON leaderboard

- [ ] Phase 5 — JSON leaderboard
    - [ ] Milestone 5.1 — Session results
        - [ ] T-038 — Implement result validation ranking and top ten
            Scope: src/leaderboard/validation.ts, store.ts; result fixtures.
            Depends on: T-037. Contract: L-01.
            Evidence: Safe integers, stable IDs, strict calendar UTC, duplicate rejection, deterministic ties and truncation.
        - [ ] T-039 — Record each game-over result exactly once
            Scope: app/controller.ts; injected ID/time provider; lifecycle fixtures.
            Depends on: T-038. Contract: L-01, G-02, S-01.
            Evidence: Unique ID/time on first completion, exclude abandoned games, retain restored-ID uniqueness and no duplicate events.
        - [ ] T-040 — Render and verify page-lifetime results
            Scope: browser/panels.ts; browser result suite.
            Depends on: T-038, T-039. Contract: L-01, A-07.
            Evidence: Rank/score/time labels, top ten after games, restart retention and reload clearing with unchanged persistent settings.
            Milestone exit: review the whole 5.1 capability and dependencies; run focused/browser/regression checks as applicable; fix blockers; include `docs/dev/reports/phases/5/5.1.md` and refreshed HANDOFF with this task’s result and initial completion. TODO section: None or evidence-backed eligible deferrals.
    - [ ] Milestone 5.2 — JSON contract
        - [ ] T-041 — Compile and publish the canonical JSON Schema
            Scope: src/leaderboard/json.ts; canonical schema import; scripts/copy-schema.mjs; generated public schema.
            Depends on: T-040. Contract: L-02 and LEADERBOARD-SCHEMA.json.
            Evidence: Pinned schema validator without coercion/default/removal, registered strict UTC format, downloadable schema byte equality and invalid-calendar corpus.
        - [ ] T-042 — Implement JSON encode and validated decode
            Scope: src/leaderboard/json.ts; validation.ts collaborators; JSON fixtures.
            Depends on: T-041. Contract: L-02, L-04 JSON dispatch subset.
            Evidence: Versioned UTF-8 export, bounded input, schema-first and semantic validation; empty/ten/unsorted round trips preserve values.
        - [ ] T-043 — Verify JSON failures and codec compatibility
            Scope: tests/unit/leaderboard/json.test.ts; invalid-file fixtures; affected codec owners.
            Depends on: T-041, T-042. Contract: L-01/L-02, A-08 JSON subset.
            Evidence: Malformed UTF-8/JSON, unknown fields/version, wrong types, dates, duplicate IDs, excess count and byte limits reject as a whole.
            Milestone exit: review the whole 5.2 capability and dependencies; run focused/browser/regression checks as applicable; fix blockers; include `docs/dev/reports/phases/5/5.2.md` and refreshed HANDOFF with this task’s result and initial completion. TODO section: None or evidence-backed eligible deferrals.
    - [ ] Milestone 5.3 — Manual JSON files
        - [ ] T-044 — Add JSON Save and atomic Restore below results
            Scope: leaderboard/files.ts; browser/files.ts, panels.ts; controller operation wiring.
            Depends on: T-043. Contract: L-04 JSON, S-04.
            Evidence: Actual download/upload path, immutable save snapshot, fully validated replace-not-merge and gameplay/file-action pause.
        - [ ] T-045 — Handle file cancellation errors and resource cleanup
            Scope: leaderboard/files.ts; browser/files.ts; controller pause/operation tests.
            Depends on: T-044. Contract: L-04, S-04.
            Evidence: Picker cancellation, file/read/download failures, deadline/stale reply, disabled concurrency and cleanup preserve prior list and other pause reasons.
        - [ ] T-046 — Verify and document JSON portability in browsers
            Scope: tests/browser/JSON file suite; docs/user/LEADERBOARD.md; package/version.
            Depends on: T-044, T-045. Contract: L-01/L-02/L-04 JSON, A-07/A-08/A-09.
            Evidence: Download bytes then restore empty/ten files, invalid restore leaves state, schema download works in Chromium/Firefox; expose JSON-only capability honestly for 0.5.0.
            Milestone exit: review the whole 5.3 capability and dependencies; run focused/browser/regression checks as applicable; fix blockers; include `docs/dev/reports/phases/5/5.3.md` and refreshed HANDOFF with this task’s result and initial completion. TODO section: None or evidence-backed eligible deferrals.
    - [ ] Milestone 5.4 — Phase review
        - [ ] T-047 — Review test and report phase 5
            Scope: complete phase code and integration boundaries, required acceptance/regressions, blocker repairs, report and release readiness for 0.5.0.
            Depends on: T-046; all phase 5 delivery milestones completed and closed, including their folded review/report obligations.
            Evidence: independently assess code and executed checks, confirm phase exits and preserved predecessor behavior, reconcile findings/TODOs and exact version/package/release-note source; include `docs/dev/reports/phases/5/PHASE-REPORT.md` and refreshed HANDOFF in this task’s completion commit.

## Phase 6 — SQLite portability

- [ ] Phase 6 — SQLite portability
    - [ ] Milestone 6.1 — SQLite encoding
        - [ ] T-048 — Bundle a lazy bounded SQLite worker
            Scope: leaderboard/sqlite.worker.ts, sqlite.ts; local WASM/build wiring.
            Depends on: T-047. Contract: L-03/L-04, ARCHITECTURE file boundary.
            Evidence: Pinned compatible sql.js/WASM, asynchronous local initialization, operation IDs/error replies, worker disposal and no effect on gameplay/JSON after load failure.
        - [ ] T-049 — Encode versioned SQLite leaderboard files
            Scope: leaderboard/sqlite.ts; real SQLite byte fixtures.
            Depends on: T-048. Contract: L-03.
            Evidence: Genuine database header, user_version=1, exact ordinary table, bound inserts, integer score storage and empty/ten preserved records.
        - [ ] T-050 — Integrate and verify SQLite downloads
            Scope: browser/files.ts; leaderboard/files.ts; browser export checks.
            Depends on: T-048, T-049. Contract: L-03 export, L-04 Save.
            Evidence: SQLite export through real UI, actual downloaded database inspection and cleanup in both browsers; preserve JSON export.
            Milestone exit: review the whole 6.1 capability and dependencies; run focused/browser/regression checks as applicable; fix blockers; include `docs/dev/reports/phases/6/6.1.md` and refreshed HANDOFF with this task’s result and initial completion. TODO section: None or evidence-backed eligible deferrals.
    - [ ] Milestone 6.2 — Validated SQLite restore
        - [ ] T-051 — Validate SQLite identity integrity and schema
            Scope: leaderboard/sqlite.ts; real corrupt/schema fixture corpus.
            Depends on: T-050. Contract: L-03.
            Evidence: Header/version/integrity, complete column/hidden/type/PK checks, reject views/triggers/extra objects and never execute imported SQL.
        - [ ] T-052 — Validate every SQLite result and input bound
            Scope: leaderboard/sqlite.ts; shared validation; database row fixtures.
            Depends on: T-051. Contract: L-01/L-03.
            Evidence: Integer storage class/safe range, text IDs/calendar UTC, duplicates/eleventh row and file size; valid unsorted data ranks identically to JSON.
        - [ ] T-053 — Integrate bounded atomic SQLite restore
            Scope: sqlite.worker.ts; files/controller ports; browser restore tests.
            Depends on: T-051, T-052. Contract: L-03/L-04, S-04.
            Evidence: Content-detected restore, no partial state, initialization/read failure, timeout/cancel/stale reply and resource teardown preserve JSON and existing scores.
            Milestone exit: review the whole 6.2 capability and dependencies; run focused/browser/regression checks as applicable; fix blockers; include `docs/dev/reports/phases/6/6.2.md` and refreshed HANDOFF with this task’s result and initial completion. TODO section: None or evidence-backed eligible deferrals.
    - [ ] Milestone 6.3 — Dual-format delivery
        - [ ] T-054 — Complete format selection and file help
            Scope: browser/panels.ts, files.ts; docs/user/LEADERBOARD.md; schema link.
            Depends on: T-053. Contract: L-02–L-04, S-05.
            Evidence: Save offers JSON/SQLite, Restore accepts either by content, extension mismatch handled, clear errors and preserved record fields.
        - [ ] T-055 — Verify cross-format and packaged browser behavior
            Scope: tests/browser/dual-format suite; packaged worker/WASM/schema paths; affected owners.
            Depends on: T-054. Contract: A-01–A-09 complete applicable coverage.
            Evidence: JSON→SQLite→JSON value preservation, empty/ten/invalid files, subdirectory static deployment, local assets/no CDN and complete predecessor regressions in both browsers.
        - [ ] T-056 — Package and document the complete product
            Scope: package/version/build/CI assets; README, user guides and release-note inputs.
            Depends on: T-054, T-055. Contract: Full SPEC and Phase 6 exits.
            Evidence: Reproducible 1.0.0 static package, correct local worker/WASM/schema URLs, notices and truthful validated commands; exclude credentials/cache/skills/provenance from product.
            Milestone exit: review the whole 6.3 capability and dependencies; run focused/browser/regression checks as applicable; fix blockers; include `docs/dev/reports/phases/6/6.3.md` and refreshed HANDOFF with this task’s result and initial completion. TODO section: None or evidence-backed eligible deferrals.
    - [ ] Milestone 6.4 — Phase review
        - [ ] T-057 — Review test and report phase 6
            Scope: complete phase code and integration boundaries, required acceptance/regressions, blocker repairs, report and release readiness for 1.0.0.
            Depends on: T-056; all phase 6 delivery milestones completed and closed, including their folded review/report obligations.
            Evidence: independently assess code and executed checks, confirm phase exits and preserved predecessor behavior, reconcile findings/TODOs and exact version/package/release-note source; include `docs/dev/reports/phases/6/PHASE-REPORT.md` and refreshed HANDOFF in this task’s completion commit.
            Final boundary: include `docs/dev/reports/IMPLEMENTATION-REPORT.md`, aggregate every unresolved/deferred milestone and phase TODO with provenance and options, and distinguish verified full-target acceptance from pending integration/release effects.
