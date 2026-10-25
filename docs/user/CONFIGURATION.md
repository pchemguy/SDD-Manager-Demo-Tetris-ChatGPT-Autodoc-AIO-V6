# Game configuration

Use the six native selects in Settings. Click the board afterward to resume keyboard control. The board stays alongside settings on desktop; the side panel may scroll.

| Control | Default | Effect |
| --- | --- | --- |
| Ghost visibility | Always show | Always hide, hide when any projected cell is above row 10, or always show. Rows 10–19 form the lower half. A straddling projection hides in dynamic mode. |
| Hard drop | On | Off disables Space without changing the ghost. |
| Next-piece preview | On | Off hides the preview without consuming the queue. |
| Hard-drop locking | Follow general policy | Immediate locks a legal hard-drop target, including a zero-distance drop. |
| General locking | Full gravity interval | A grounded piece gets one full current gravity interval. Failed-down mode instead locks on an actual failed Down/gravity attempt. |
| Hold piece | On | Off preserves the stored piece and the once-per-piece used state. An active penetrator always blocks hold. |

Visibility and availability change immediately. Both locking policies apply at the next spawn, including a hold replacement. The active piece keeps its captured choices. Grounded movement does not reset an interval deadline; leaving the ground cancels it. Repeated zero-distance hard drops do not extend it. Penetrator ghost and hard drop use the same deepest legal landing under every policy.

## Cookies and shareable URLs

Each setting resolves independently from one valid URL parameter, then its saved cookie, then the default. Tokens are exact and case-sensitive. Empty, unsupported or repeated parameters fall back to the cookie/default; repeated values are invalid even when equal. Unknown parameters are preserved.

| URL parameter | Cookie | Values |
| --- | --- | --- |
| `ghost` | `tetris_ghost` | `hide`, `dynamic`, `show` |
| `hardDrop` | `tetris_hardDrop` | `on`, `off` |
| `next` | `tetris_next` | `on`, `off` |
| `hardDropLock` | `tetris_hardDropLock` | `follow`, `immediate` |
| `lock` | `tetris_lock` | `failed-down`, `interval` |
| `hold` | `tetris_hold` | `on`, `off` |

For example, `?ghost=dynamic&lock=failed-down` selects those two choices and retains saved choices for the other four. An explicit `ghost=show` saves that default in its cookie. Omitting `ghost` retains the saved cookie rather than resetting it.

Changing a select saves only that setting's cookie and updates its parameter without navigation or a new history entry. The path, fragment, unrelated parameters and history state remain. Cookies last up to one year, use Path=/ and SameSite=Lax, and add Secure on HTTPS. They are subject to browser origin/storage policy. Sharing the URL transfers explicit settings; it never transfers scores.

If cookies or history updates fail, Settings shows a nonblocking message and the chosen setting remains active for this page. Either write can succeed independently. Reload uses the values actually present. Clear saved cookies and remove parameters to restore defaults.
