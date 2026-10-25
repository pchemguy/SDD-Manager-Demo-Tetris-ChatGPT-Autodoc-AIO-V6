/** One ordinary projection path is shared by grounded-state checks and consumers. */
import { canPlace } from './board';
import type { Board, Piece } from './types';
export function landing(board: Board, piece: Piece): Piece | null {
  if(!canPlace(board,piece)) return null;
  let target={...piece};
  while(canPlace(board,{...target,y:target.y+1})) target={...target,y:target.y+1};
  return target;
}
