# Component decomposition

## Responsibility model

The [architecture](ARCHITECTURE.md) defines browser-independent domain rules with controller-owned orchestration and isolated browser/file adapters. Components below are logical boundaries, not a mandatory class hierarchy. Small pure functions may share a cohesive module; mutable state has one owner.

| Component | Provides / owns | Requires / excludes | Verification seam |
| --- | --- | --- | --- |
| Piece geometry | Immutable spawn cells, orientation transforms, SRS kick candidates and piece colors. | Piece kind/orientation; excludes board mutation and random selection. | Exact cell/kick fixtures, rotation cycles and O invariance. |
| Board rules | Bounds/collision predicates and simultaneous line compaction. Owns the settled-cell representation. | Geometry cells; excludes active-piece lifetime and scoring. | Edge/top collision, non-overlap and multirow clear fixtures. |
| Landing rules | Ordinary first-obstruction and penetrator deepest-valid targets, plus candidate viability. | Board snapshot and piece transform; excludes rendering/clock. | Exhaustive row enumeration against hand-constructed obstructions. |
| Piece source | Independent random draws for classic baseline and Fisher–Yates seven-bag mode. Owns queue, bag and injected entropy position. | Bounded entropy function; excludes hold and UI previews. | Seeded sequences, bag permutations, preview consumption. |
| Game transitions | Active piece, board, source, hold, score/lines/level, bonuses, captured lock policies and gravity/ground deadlines. Provides serial command/time transitions, read-only snapshot and game-over event. | Geometry, board, landing, piece source and validated settings. No browser APIs. | Direct command/time traces at exact boundaries. |
| Runtime controller | Owns current game instance and settings, input order, pause reasons, logical game time and file-operation identity. Routes events exactly once. | Game API, render/input ports, configuration and leaderboard/file services. Excludes collision/SQL/schema rules. | Fake clock and ports; event-order, pause and stale-reply checks. |
| Input adapter | Keyboard mapping, held-key repeat, focus reset and control-button actions. | Focus targets and controller commands; excludes game-state mutation. | Browser key/control/focus interaction. |
| Renderer | Canvas board/ghost/piece and HTML score, previews, hold, bonus and leaderboard panels. | Read-only snapshots/settings/results; excludes projection recomputation. | Geometry assertions and inspected screenshots in both browsers. |
| Settings definitions | Six typed keys, accepted serialization tokens and defaults. | No IO. Excludes source precedence. | Enumerated valid/invalid tokens. |
| Settings service | Per-key precedence, explicit-query cookie writes, independent persistence attempts and warnings. | Definitions, cookie and URL/history ports. Excludes gameplay policy reinterpretation. | Synthetic duplicate/invalid/omitted/default URLs and failure adapters. |
| Result validator | Safe integer score, stable ID, canonical UTC timestamp, uniqueness and result-count validation. | Untrusted candidates; returns validated immutable result values or structured errors. | Semantic boundary corpus shared by both codecs. |
| Leaderboard store | Page-lifetime top ten, ranking, game-over insertion and single atomic replacement. | Validated results, injected ID/time providers. No file or browser persistence. | Tie/trim/duplicate-event/replacement fixtures. |
| JSON codec | Versioned JSON export and schema-first import using a bundled schema and explicit timestamp format. | Result validator and schema validator. No store mutation or coercion. | Schema/semantic negative corpus, empty and full round trips. |
| SQLite codec worker | Real database byte export/import, version/schema/integrity checks and result decoding. Owns temporary database/statements. | Bundled sql.js/WASM and shared result contracts; no imported SQL execution or leaderboard access. | Actual SQLite bytes, corrupt/schema/version/row fixtures and disposal checks. |
| File operation service | Format detection, byte limits, worker deadline, candidate handoff, download lifecycle and cancellation. | Codecs, browser file/download ports and controller operation identity. Excludes ranking and live-store writes. | Files, timeout/cancel/reply races, failed download and URL cleanup. |

## Principal interfaces

The game boundary accepts `start`, `restart`, `move`, `rotate`, `softDrop`, `hardDrop`, `hold`, `activatePenetrator`, settings changes and logical time advancement. The domain snapshot contains settled cells, active transform, projected landing, queue preview, held kind, numeric stats, bonus count and lifecycle status. Projection is computed once by domain rules for the snapshot and reused by hard-drop execution; neither renderer nor controller implements a second projection algorithm.

Each transition returns events separately from snapshots. Game-over carries a game-instance identity, so the controller can reject duplicate completion events without relying on draw frequency. ID and completion timestamp creation occur when the controller handles the first completion event; file decoding preserves existing IDs/times rather than regenerating them.

Settings resolution returns a complete validated settings value and persistence outcomes. The controller supplies current availability flags to commands and captures locking policies on spawn. Ports expose reads and attempted writes with structured success/failure; failures do not masquerade as persisted settings.

File decoding returns a fully validated result collection or an error with format, category and user-readable context. Encoding consumes an immutable snapshot and returns bytes/type/filename. Only the controller can request the leaderboard store's replacement operation. A worker message includes operation ID and a discriminated success/error result; the controller rejects a reply after cancellation or a superseding operation.

## Collaboration and lifecycle

1. Startup resolves settings before the first piece spawns, constructs an empty leaderboard and ready game, and renders the initial screen.
2. A browser command advances the logical clock to its event boundary, checks pause/focus, applies one domain command and renders its snapshot. Repeated keys cannot create duplicate one-shot actions.
3. Grounding, penetration, line clearing, scoring and piece spawning occur within the domain transition. A game-over event is routed to the store once, and the renderer receives the resulting ranked list.
4. Save/Restore adds a file-operation pause reason, snapshots or reads bytes, invokes the selected codec and disables file actions. Successful Restore validates then replaces once; all failures preserve the old collection. Completion removes only that pause reason and disposes resources.
5. Restart constructs a fresh game with current settings and entropy; it leaves session results and settings intact and resets input repeat/timing. Page reload constructs a new leaderboard.

The settled board never owns transient penetrator overlap. Hold is blocked within game transitions when penetrator-active, not merely hidden by presentation. Activation spends a bonus only after viability succeeds. Preview and ghost settings change visibility without consuming queue entries or advancing play.

## Failure and ownership boundaries

Rejected movement and unavailable gameplay commands are normal no-op transitions. Browser persistence failures produce a non-blocking warning. File validation, unsupported version/format, worker initialization/deadline and browser download failures produce a visible operation error and preserve state. A corrupt file cannot supply module names, SQL statements or UI markup.

Temporary databases/statements are released in `finally` paths; workers are terminated after each operation; object URLs are revoked after the browser has consumed or rejected the download. The controller clears owned listeners, repeats and animation callbacks on teardown. Domain snapshots do not expose mutable arrays to renderer consumers.

## Conformance review

Every architectural block has components with one state owner and explicit inbound/outbound boundaries. Board/landing/transition collaboration remains inside the game domain; presentation and file services cannot mutate its state. Settings and codec variation have actual consumers, while speculative extension registries are excluded. Shared result validation and landing rules remove duplicated decisions. Exact tokens, timing, schema/SQL metadata, resource limits and acceptance belong to SPEC; delivery order and physical paths belong to PLAN and layout.
