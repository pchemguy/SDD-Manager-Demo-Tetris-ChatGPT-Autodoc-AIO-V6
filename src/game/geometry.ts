/** Piece cells use downward-positive coordinates, with fixed local pivots. */
import type { Kind, Piece, Point } from './types';
const SPAWN: Record<Kind, readonly (readonly [number, number])[]> = {
  I: [[0,1],[1,1],[2,1],[3,1]], J: [[0,0],[0,1],[1,1],[2,1]],
  L: [[2,0],[0,1],[1,1],[2,1]], O: [[1,0],[2,0],[1,1],[2,1]],
  S: [[1,0],[2,0],[0,1],[1,1]], T: [[1,0],[0,1],[1,1],[2,1]],
  Z: [[0,0],[1,0],[1,1],[2,1]],
};
export const COLORS: Record<Kind, string> = {
  I:'#32d9e6', J:'#6583ff', L:'#ffae52', O:'#f5d65c', S:'#68dd99', T:'#bd8aff', Z:'#fa7287',
};
/** Return fresh absolute cells; callers cannot mutate canonical geometry. */
export function cells(piece: Piece): Point[] {
  const pivot = piece.kind === 'I' ? 1.5 : 1;
  return SPAWN[piece.kind].map(([sx,sy]) => {
    let x=sx,y=sy;
    if(piece.kind!=='O') for(let n=0;n<piece.orientation;n++) [x,y]=[pivot-(y-pivot),pivot+(x-pivot)];
    return {x:x+piece.x,y:y+piece.y};
  });
}
