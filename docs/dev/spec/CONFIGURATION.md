# Configuration contracts

## C-01: Controls, tokens and defaults

Provide a labeled side-panel select or toggle for each setting. Serialization tokens are case-sensitive; do not trim, coerce or accept synonyms.

| Setting | URL parameter | Cookie name | Tokens | Default |
| --- | --- | --- | --- | --- |
| Ghost visibility | `ghost` | `tetris_ghost` | `hide`, `dynamic`, `show` | `show` |
| Hard-drop availability | `hardDrop` | `tetris_hardDrop` | `on`, `off` | `on` |
| Next preview | `next` | `tetris_next` | `on`, `off` | `on` |
| Hard-drop locking | `hardDropLock` | `tetris_hardDropLock` | `follow`, `immediate` | `follow` |
| General locking | `lock` | `tetris_lock` | `failed-down`, `interval` | `interval` |
| Hold availability | `hold` | `tetris_hold` | `on`, `off` | `on` |

Availability and visibility apply immediately. Both locking policies are captured when a piece spawns; a visible note explains that changed policies apply to the next piece. Disabling hold preserves its contents/used state; disabling hard drop leaves the ghost unaffected. Hidden next/hold panels retain a label explaining the setting and never consume queue state.

## C-02: Independent initialization

For each setting: accept exactly one valid URL parameter; otherwise accept exactly one valid matching cookie; otherwise use its default. Empty, malformed, unsupported, repeated URL values and invalid/duplicate cookies are absent for this decision. URL decoding follows standard URL parsing; cookie decoding failures are invalid values. Repetition invalidates that key even if repeated values are equal. Unrelated keys and unknown parameters do not affect the six settings.

Every valid explicit URL value is written to its cookie, including an explicit default. Omitted or invalid URL values do not schedule replacement of an existing cookie with a default. Do not write defaults merely because no source is present. Resolve all six values before game creation; one bad setting cannot reset another.

## C-03: Changes and persistence

On a valid user change, update the in-memory selection, attempt that cookie write and set exactly one corresponding URL parameter using `history.replaceState`, preserving unrelated parameters, path and fragment. Collapse prior duplicates for the changed key. Do not navigate/reload or add history entries. Write only the changed setting; never synthesize parameters for untouched settings.

Cookies use `Path=/`, `SameSite=Lax`, `Max-Age=31536000` and `Secure` on HTTPS. Keep names/tokens limited to the table. Reading cookies must select by complete name, not substring. Persistence is scoped by browser origin/path behavior; sharing the URL intentionally transfers settings but never scores.

## C-04: Persistence failures and acceptance

Cookie and URL writes are independent attempts; failure of one does not suppress the other or revert the active selection. Read back the intended cookie value when access permits; report inability to persist in visible non-blocking status text. If history or cookies are unavailable, gameplay and controls remain usable for the current page. Reload uses values actually present, without claiming failed persistence succeeded.

Acceptance includes all six keys with URL→cookie→default precedence, explicit-default writes, mixed-source resolution, omitted-parameter retention, duplicate/invalid values, unrelated URL preservation, live versus next-piece effects and isolated cookie/history failures. Browser reload checks must verify actual browser cookies/query, not only mocked adapters.
