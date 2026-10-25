# System specification

## Scope and ownership

Deliver the single-player desktop keyboard game described in [PROJECT](PROJECT.md), following [ARCHITECTURE](ARCHITECTURE.md) and [DECOMPOSITION](DECOMPOSITION.md). The complete system includes classic play, modern assistance, penetrator bonuses, six configurable/persistent settings, a page-lifetime top ten and manual JSON/SQLite result portability. There is no application backend, account, multiplayer, touch-control requirement or automatic permanent leaderboard storage.

The game domain owns all board/timing/landing/hold/bonus transitions. The controller owns logical time, pause reasons, event ordering, completed-game insertion and atomic restore. Presentation reads snapshots; configuration/file adapters report failures without mutating domain rules or partially replacing scores.

| Contract group | Canonical detailed owner | Participating components |
| --- | --- | --- |
| G-01–G-09: board, lifecycle, input, gravity, locking, scoring, queue, hold, projection/drop | [GAMEPLAY](spec/GAMEPLAY.md) | Game transitions, geometry, board/landing/source, input/controller/renderer |
| R-01: rotations and ordered kicks | [ROTATION](spec/ROTATION.md) | Geometry, board/landing validation |
| P-01–P-03: activation, penetration and bonuses | [GAMEPLAY](spec/GAMEPLAY.md#penetrator-contracts) | Game transitions, landing, renderer |
| C-01–C-04: controls, precedence, writes and failures | [CONFIGURATION](spec/CONFIGURATION.md) | Settings definitions/service, browser ports, controller |
| L-01–L-04: session results and manual files | [LEADERBOARD](spec/LEADERBOARD.md) and [JSON Schema](spec/LEADERBOARD-SCHEMA.json) | Store, result validator, codecs, file service, controller |

## Cross-component guarantees

S-01: One serial game transition processes a command only after advancing logical game time to that command's boundary. An already-due lock wins over input at the same instant. Input at an earlier instant can move the piece. Paused time contributes neither gravity nor lock delay. A successful lock emits at most one completion event for the game instance.

S-02: The ghost and hard-drop action use the same landing function, including penetrator mode. Locking always checks legal containment and non-overlap independently. Settled cells change only on successful lock, simultaneous line clear or a fresh game.

S-03: Startup resolves each setting before constructing the first piece. Availability/visibility changes apply immediately, while both locking policies are captured at each spawn. Settings changes never advance gameplay time, consume queue items or erase scores.

S-04: File operations pause gameplay, suppress gameplay commands and disable concurrent file actions. Save uses one immutable snapshot. Restore makes exactly one replacement only after the entire input passes validation. Cancellation/failure preserves the old results and releases resources. Completing a file action removes only its own pause reason.

S-05: The application runs from static assets over HTTP(S) in isolated Chromium and Firefox. No application data is uploaded. Production dependencies/WASM are packaged locally; no runtime third-party CDN is required. The board and controls remain usable at a desktop viewport of 1024×768 and above, with scrolling permitted for long panels. Controls have visible labels, native focus and visible error/status text; keyboard input does not interfere with focused form controls.

## System acceptance

| ID | Observable acceptance |
| --- | --- |
| A-01 | Start, move, rotate, descend, clear lines, score, increase level, pause, reach game over and restart a classic game. Spawn failure and lock-out end play once; restart preserves settings and session scores. |
| A-02 | Verify seven-bag permutations, exact rotation/kick fixtures, hold once per piece, disabled hold/next/hard-drop settings, and matching ghost/drop targets at floor, walls and occupied stacks. |
| A-03 | At grounding time `t`, remain unlocked just before `t + interval` and lock at that deadline. Grounded movement preserves it, ungrounding cancels it, pause freezes it, and hard-drop policy obeys the per-piece snapshot. Check same-instant input ordering. |
| A-04 | Dynamic ghost hides when any projected cell is above row 10 and appears when all are at row 10 or below. Test a straddling piece and both always-visible/hidden settings. |
| A-05 | Activate/spend once, cross occupied cells, reject impossible moves/activation without invalid locks, reach the deepest legal hard-drop target, retain occupied cells, disable active-penetrator hold, render white and update zero-to-three bonus symbols. Four-line awards and cap work, including penetrator clears. |
| A-06 | Resolve URL/cookie/default independently, including valid default URL writes, omitted parameters, malformed/duplicate values, mixed sources and failed persistence APIs. After reload, observe surviving settings; score history resets. |
| A-07 | Add each completed game once, exclude abandoned games, rank and trim to ten, preserve stable IDs/times through sorting and restore, and keep results through restart. |
| A-08 | Empty and ten-result JSON/SQLite exports download and restore exactly. Reject malformed/unsupported/oversized files, invalid timestamps/IDs/scores, duplicate IDs, excess rows, corrupt/schema-invalid databases and timeout failures without changing current scores. |
| A-09 | Exercise actual browser controls, focus/visibility pause, screenshots/Canvas rendering, cookies/URL, downloads/uploads and worker teardown in both required browsers. Domain-only checks are insufficient evidence for rendering or file UI. |

Contract fixtures, browser checks and release acceptance are separate evidence. A planned test is not a passed test; earlier capability increments are assessed against their included contract subsets and preserved predecessor behavior.
