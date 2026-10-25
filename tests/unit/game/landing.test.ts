/** Constructed gaps distinguish first obstruction from deepest placement. */
import {expect,it} from 'vitest';
import {landing} from '../../../src/game/landing';
import {canPlace,emptyBoard} from '../../../src/game/board';
import {cells} from '../../../src/game/geometry';
import {KINDS,type Piece} from '../../../src/game/types';
const square:Piece={kind:'O',orientation:0,x:3,y:0};
it('stops above an overhang even when a lower gap is legal',()=>{
 const board=emptyBoard();board[8][4]='J';const before=structuredClone(board);
 expect(landing(board,square)).toEqual({...square,y:6});expect(canPlace(board,{...square,y:18})).toBe(true);expect(board).toEqual(before);
});
it('returns no fully visible target when first obstruction leaves hidden cells',()=>{
 const board=emptyBoard();board[1][3]='Z';
 expect(landing(board,{kind:'T',orientation:0,x:3,y:-1})).toBeNull();
});
it('rejects an invalid current placement without inventing an escape',()=>{
 const board=emptyBoard();board[0][4]='Z';expect(landing(board,square)).toBeNull();expect(landing(emptyBoard(),{...square,x:-2})).toBeNull();
});
it('lands each orientation exactly at its bottom boundary without overlap',()=>{
 const board=emptyBoard();for(const kind of KINDS)for(const orientation of [0,1,2,3] as const){
  const target=landing(board,{kind,orientation,x:3,y:0})!;
  expect(canPlace(board,target)).toBe(true);expect(canPlace(board,{...target,y:target.y+1})).toBe(false);
  expect(Math.max(...cells(target).map(p=>p.y))).toBe(19);expect(cells(target).every(p=>p.y>=0)).toBe(true);
 }
});
