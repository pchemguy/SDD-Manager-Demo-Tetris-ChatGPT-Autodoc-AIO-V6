# Browser Tetris

## Purpose and users

Build a single-player browser Tetris game for keyboard players, starting with a small playable classic game and growing through useful, bounded increments. The completed product combines familiar play, configurable assistance, a penetrator bonus mechanic and portable personal results. It runs as a static application without an account or application backend.

## Intended outcomes and scope

- Deliver falling tetrominoes, movement, rotation, gravity, line clearing, scoring, increasing level/speed, game over and restart on a conventional 10-column, 20-row visible board. Include pause so interrupted play does not penalize the player.
- Add hold, ghost, 7-bag randomization, SRS wall kicks, hard drop and a default lock delay lasting one full gravity interval from becoming grounded. Hard drop follows the general policy unless immediate locking is selected.
- Offer ghost visibility modes of hidden, dynamic above the midline and always visible. Ghost and hard drop share a landing calculation, including penetrator behavior.
- Award one penetrator activation for a four-line clear, up to three stored bonuses. A hotkey spends one bonus on the current falling piece until it locks. It passes through occupied cells without deleting them, but can lock only entirely inside the board without overlap. Its hard drop reaches the lowest valid landing. Render it entirely white, reserve nonwhite colors for ordinary pieces and show one side-panel symbol per available bonus.
- Provide controls for all six requested settings: ghost visibility, hard-drop availability, next preview, hard-drop lock policy, general lock policy and hold availability.
- Persist each setting independently using valid explicit URL value, then valid cookie value, then default. Changes update both its cookie and query parameter. Explicit valid URL defaults also update cookies; omitted parameters preserve saved cookie choices.
- Show the ten best completed games in a session leaderboard, updating after each game. Offer manual Save and Restore below it, supporting JSON and SQLite and replacing the current results on successful restore.
- Preserve stable result IDs, non-negative integer scores and UTC completion timestamps across both formats. Version JSON and SQLite; publish a JSON Schema and validate JSON against it, including timestamps. SQLite has one `high_scores(id, score, timestamp)` table and database version metadata. Validate the entire input before replacing session state; errors leave current results intact.

## Proposed gameplay decisions

These choices are proposed for confirmation with this brief; they are not additional user-supplied requirements.

| Concern | Proposed behavior and reason |
| --- | --- |
| Ghost straddling the midline | Show a dynamic ghost only when all four projected cells are in the lower half (rows 10–19, counting from zero). Hide a ghost with any cell above it; this gives an unambiguous whole-piece boundary. |
| Lock-delay resets | Start the timer on grounding using the current gravity interval. Grounded movement and rotation do not restart it; leaving the ground cancels it and a later grounding starts a fresh interval. Pause freezes it. A zero-distance hard drop does not extend an existing timer. |
| Penetrator and hold | Disable hold while the current piece is an activated penetrator, preventing bonus storage or transfer through hold. No manual deactivation or refund after successful activation. |
| Penetrator movement and locking | Occupied cells do not block active penetrator movement or rotation; board boundaries still apply. Accept activation or a new position/orientation only when a valid non-overlapping landing exists at or below it. Gravity stops at that lowest valid landing. Reject an impossible activation without spending a bonus. |
| Failed-down lock mode | Lock only at a legal landing on a failed downward attempt. Temporary overlap during penetration never causes a lock or deletion of existing blocks. |
| Invalid configuration | An invalid or repeated URL setting is ignored for that setting, allowing valid cookie/default fallback; invalid cookies fall back to defaults. Do not overwrite a good cookie with invalid URL input. Preserve unrelated URL parameters. |
| Changing settings during play | Availability and visibility controls apply immediately. Snapshot both locking policies when a piece spawns, avoiding timer reinterpretation mid-piece. |
| Session and completed games | A session is the current page lifetime; reloading clears the leaderboard, while configuration follows its separate persistence rules. Record game-over results once; restarting or abandoning a running game creates no result. |
| Ranking and restore | Rank by descending score, then earlier completion timestamp, then stable ID. Reject duplicate IDs, more than ten imported results, unsupported versions, malformed timestamps or invalid records as a whole. Restore does not resume gameplay. |

## Technical direction and constraints

Propose TypeScript, a Canvas board and semantic HTML controls, packaged as static browser assets. This supports explicit gameplay/data types and straightforward rendering without an application UI framework. Plain JavaScript would reduce build tooling; a framework would provide richer UI structure but adds little value for this scope. The proposed direction favors predictable game rules and small dependencies; exact libraries and versions belong to the architectural and implementation decisions.

Target desktop keyboard use. Use isolated Chromium as the primary browser and Firefox as the secondary browser, consistent with [the browser policy](../../BROWSER_DEV_POLICY.md). Verify gameplay rules independently of rendering and browser storage, then exercise interaction, rendering, persistence and file round trips in browsers. Document-only work does not require browser installation.

Keep JSON and SQLite processing local to the browser. No hosted score service, multiplayer, accounts, mobile touch controls or automatic permanent score storage is proposed. These exclusions keep the initial product focused; manual downloads remain the persistent results mechanism.

## Delivery and success

The first implementation increment must be a playable classic game. Add modern play, penetrator behavior, configuration, settings persistence and leaderboard/file portability in bounded useful increments, with precise boundaries defined in the delivery plan. Use semantic versioning: propose `0.1.0` for the first verified playable release, increment minor versions for capability additions and use `1.0.0` when the complete agreed scope is verified. Publish a GitHub release after each implementation phase is verified and integrated; do not release documentation as if it were a playable product.

Success means a responsive playable game, consistent ghost/drop/locking behavior, settings that respect independent precedence, deterministic leaderboard ranking and lossless valid exports/restores with atomic failure handling. Detailed acceptance criteria and file-format contracts will be defined in the specification.
