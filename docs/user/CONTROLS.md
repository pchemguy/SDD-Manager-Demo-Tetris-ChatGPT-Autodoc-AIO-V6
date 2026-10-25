# Game controls

Start with the button or Enter. Click the board to return keyboard focus after using a control.

| Action | Control |
| --- | --- |
| Move left/right | Left/Right arrows |
| Soft drop | Down arrow |
| Hard drop | Space |
| Hold | C or either Shift key |
| Rotate clockwise | Up arrow or X |
| Rotate counterclockwise | Z |
| Pause/resume | P, Escape or Pause/Resume button |
| Start after ready/game over | Enter or Start/Restart button |
| Abandon and restart a live run | Explicit Restart button |

Holding an arrow repeats after 150 ms and then every 50 ms. The most recently pressed horizontal direction wins; releasing it resumes the other held direction after a fresh delay. Pause, focus loss and restart clear held keys. Form controls retain their normal keyboard behavior. Enter does not abandon a playing or paused game.

Complete a horizontal row to clear it. One/two/three/four simultaneous lines award 100/300/500/800 points multiplied by the level before the clear. Each successful soft-drop row awards one point. Every ten cleared lines increases the level and falling speed. A grounded piece locks after one full gravity interval; grounded movement does not restart the timer. Leaving the ground cancels it until the next landing.

The game pauses while its page/window loses visibility or focus. An explicit user pause remains until resumed. Game over preserves the final visible stats; restart clears the board, stats and active run. Closing/reloading the page begins a fresh run. This release has no automatic permanent score storage.

## Running a static release

Extract `browser-tetris.zip` and serve its directory over HTTP. For example, with Python 3.11 or later:

```text
python -m http.server 8000
```

Open `http://localhost:8000`. The application uses local static assets and has no account or application-server requirement. Source development uses the commands in the root README.

## Piece selection and rotation

The game draws each group of seven pieces from one shuffled bag. The Next panel previews the exact next kind without consuming it. Rotation uses ordered SRS wall/floor kicks; a rejected rotation leaves position and lock timing unchanged.

## Ghost and hard drop

The outlined ghost previews the same landing selected by Space. Hard drop awards two points per traveled row and follows the default full gravity-interval delay before locking. A drop that travels zero rows does not extend an existing deadline. Holding Space does not drop later pieces automatically.

## Hold

Press C or either Shift key to store the active kind. Hold is available once until that piece locks. An empty hold consumes Next; exchanging a stored kind leaves Next unchanged. The replacement returns to its spawn position/orientation with fresh gravity and lock timing. The panel shows the stored kind and AVAILABLE or USED state. Restart clears hold.
