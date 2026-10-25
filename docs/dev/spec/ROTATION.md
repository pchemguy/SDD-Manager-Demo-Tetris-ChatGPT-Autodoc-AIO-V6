# Rotation geometry and kicks

## R-01: Coordinate convention

Local coordinates use rightward x and downward y. JLSTZ frames are 3×3 with pivot `(1,1)`; I is 4×4 with pivot `(1.5,1.5)`. Clockwise rotation around `(cx,cy)` maps `(x,y)` to `(cx−(y−cy), cy+(x−cx))`; counterclockwise is its inverse. Orientations follow `0 → R → 2 → L → 0`. O does not move its occupied cells or need kicks.

| Kind | Spawn cells |
| --- | --- |
| I | `(0,1), (1,1), (2,1), (3,1)` |
| J | `(0,0), (0,1), (1,1), (2,1)` |
| L | `(2,0), (0,1), (1,1), (2,1)` |
| O | `(1,0), (2,0), (1,1), (2,1)` |
| S | `(1,0), (2,0), (0,1), (1,1)` |
| T | `(1,0), (0,1), (1,1), (2,1)` |
| Z | `(0,0), (1,0), (1,1), (2,1)` |

Try offsets in the written order after computing the destination orientation. Apply offsets to the piece origin. These tables already use downward-positive screen y; do not negate y a second time. Accept the first legal candidate under ordinary collision or penetrator viability. If none succeeds, preserve origin/orientation/timers. Direct 180-degree rotation is not required.

## JLSTZ kick offsets

| Transition | Ordered `(dx,dy)` offsets |
| --- | --- |
| 0→R | `(0,0), (-1,0), (-1,-1), (0,2), (-1,2)` |
| R→0 | `(0,0), (1,0), (1,1), (0,-2), (1,-2)` |
| R→2 | `(0,0), (1,0), (1,1), (0,-2), (1,-2)` |
| 2→R | `(0,0), (-1,0), (-1,-1), (0,2), (-1,2)` |
| 2→L | `(0,0), (1,0), (1,-1), (0,2), (1,2)` |
| L→2 | `(0,0), (-1,0), (-1,1), (0,-2), (-1,-2)` |
| L→0 | `(0,0), (-1,0), (-1,1), (0,-2), (-1,-2)` |
| 0→L | `(0,0), (1,0), (1,-1), (0,2), (1,2)` |

## I kick offsets

| Transition | Ordered `(dx,dy)` offsets |
| --- | --- |
| 0→R | `(0,0), (-2,0), (1,0), (-2,1), (1,-2)` |
| R→0 | `(0,0), (2,0), (-1,0), (2,-1), (-1,2)` |
| R→2 | `(0,0), (-1,0), (2,0), (-1,-2), (2,1)` |
| 2→R | `(0,0), (1,0), (-2,0), (1,2), (-2,-1)` |
| 2→L | `(0,0), (2,0), (-1,0), (2,-1), (-1,2)` |
| L→2 | `(0,0), (-2,0), (1,0), (-2,1), (1,-2)` |
| L→0 | `(0,0), (1,0), (-2,0), (1,2), (-2,-1)` |
| 0→L | `(0,0), (-1,0), (2,0), (-1,-2), (2,1)` |

## Acceptance

Verify all eight transitions for each table, offset order, pivot/cell transformation and four-rotation cycles. Include wall, floor, stack and rejected-kick cases, hidden-row bounds, O invariance and penetrator viability differences. Classic baseline rotation may test only the zero offset; the complete system requires the full tables.
