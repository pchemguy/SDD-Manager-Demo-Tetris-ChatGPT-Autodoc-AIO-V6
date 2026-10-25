/** Settled-board allocation and active-piece collision predicates. */
import { HEIGHT, WIDTH, type Board, type Piece } from './types';
import { cells } from './geometry';
export function emptyBoard(): Board { return Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(null)); }
/** Hidden active cells are allowed down to y=-2; settled collisions are visible-only. */
export function canPlace(board: Board, piece: Piece): boolean {
  return cells(piece).every(({x,y}) => x>=0 && x<WIDTH && y>=-2 && y<HEIGHT && (y<0 || board[y][x]===null));
}
