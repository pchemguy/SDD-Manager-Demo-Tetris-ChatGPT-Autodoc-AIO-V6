/** One landing service owns ordinary first-obstruction and penetrator deepest-valid targets. */
import { canPlace } from './board';
import { cells } from './geometry';
import {HEIGHT,WIDTH,type Board,type Piece} from './types';
export type LandingMode='ordinary'|'penetrator';
export function landing(board: Board, piece: Piece,mode:LandingMode='ordinary'): Piece | null {
  if(mode==='penetrator'){
    if(!cells(piece).every(p=>p.x>=0&&p.x<WIDTH&&p.y>=-2&&p.y<HEIGHT))return null;
    let target:Piece|null=null;
    for(let y=piece.y;y<HEIGHT;y++){
      const candidate={...piece,y};
      if(canPlace(board,candidate)&&cells(candidate).every(p=>p.y>=0))target=candidate;
    }
    return target;
  }
  if(!canPlace(board,piece)) return null;
  let target={...piece};
  while(canPlace(board,{...target,y:target.y+1})) target={...target,y:target.y+1};
  return cells(target).every(cell=>cell.y>=0)?target:null;
}
