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

// Ordered offsets already use downward-positive y; see normative ROTATION.md.
type Offset=readonly [number,number];
const JLSTZ:Record<string,readonly Offset[]>={
 '01':[[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
 '10':[[0,0],[1,0],[1,1],[0,-2],[1,-2]],
 '12':[[0,0],[1,0],[1,1],[0,-2],[1,-2]],
 '21':[[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
 '23':[[0,0],[1,0],[1,-1],[0,2],[1,2]],
 '32':[[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
 '30':[[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
 '03':[[0,0],[1,0],[1,-1],[0,2],[1,2]],
};
const I:Record<string,readonly Offset[]>={
 '01':[[0,0],[-2,0],[1,0],[-2,1],[1,-2]],
 '10':[[0,0],[2,0],[-1,0],[2,-1],[-1,2]],
 '12':[[0,0],[-1,0],[2,0],[-1,-2],[2,1]],
 '21':[[0,0],[1,0],[-2,0],[1,2],[-2,-1]],
 '23':[[0,0],[2,0],[-1,0],[2,-1],[-1,2]],
 '32':[[0,0],[-2,0],[1,0],[-2,1],[1,-2]],
 '30':[[0,0],[1,0],[-2,0],[1,2],[-2,-1]],
 '03':[[0,0],[-1,0],[2,0],[-1,-2],[2,1]],
};
/** Fresh candidates let the domain choose its first viable ordinary/penetrator kick. */
export function rotationCandidates(piece:Piece,direction:-1|1):Piece[] {
 const orientation=((piece.orientation+direction+4)%4) as Piece['orientation'];
 const offsets=piece.kind==='O'?[[0,0]]:(piece.kind==='I'?I:JLSTZ)[`${piece.orientation}${orientation}`];
 return offsets.map(([dx,dy])=>({...piece,orientation,x:piece.x+dx,y:piece.y+dy}));
}
