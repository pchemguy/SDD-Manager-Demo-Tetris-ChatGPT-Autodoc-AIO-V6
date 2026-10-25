/** Deepest legal placement is independent of intervening occupied rows. */
import {expect,it} from 'vitest';
import {landing} from '../../../src/game/landing';
import {emptyBoard} from '../../../src/game/board';
import {cells} from '../../../src/game/geometry';
import {KINDS,type Piece} from '../../../src/game/types';
const square:Piece={kind:'O',orientation:0,x:3,y:0};
it('passes an overhang to a lower legal target while ordinary drop stops above it',()=>{
 const board=emptyBoard();board[8][4]='J';expect(landing(board,square)?.y).toBe(6);expect(landing(board,square,'penetrator')?.y).toBe(18);
});
it('allows transient overlap without deleting occupied cells',()=>{
 const board=emptyBoard();board[8][4]='J';const before=structuredClone(board);
 expect(landing(board,{...square,y:7},'penetrator')?.y).toBe(18);expect(board).toEqual(before);
});
it('finds the deepest isolated gap even when it is above the floor',()=>{
 const board=emptyBoard();for(let y=8;y<20;y++)board[y].fill('Z');for(const y of [16,17])for(const x of [4,5])board[y][x]=null;
 expect(landing(board,square,'penetrator')?.y).toBe(16);
});
it('rejects no-target and invalid traversal-bound states',()=>{
 const full=emptyBoard();for(const row of full)row.fill('Z');expect(landing(full,square,'penetrator')).toBeNull();
 for(const piece of [{...square,x:-2},{...square,y:19},{...square,y:-3}])expect(landing(emptyBoard(),piece,'penetrator')).toBeNull();
 expect(landing(emptyBoard(),{...square,y:-2},'penetrator')?.y).toBe(18);
});
it('matches independent bottom-up enumeration for seeded obstructions and every orientation',()=>{
 let seed=9;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32;};
 for(let fixture=0;fixture<10;fixture++){
  const board=emptyBoard();for(let y=5;y<20;y++)for(let x=0;x<10;x++)if(random()<.3)board[y][x]='T';
  for(const kind of KINDS)for(const orientation of [0,1,2,3] as const){
   const piece:Piece={kind,orientation,x:3,y:-1};let expected:Piece|null=null;
   for(let y=19;y>=piece.y;y--){const candidate={...piece,y};if(cells(candidate).every(p=>p.x>=0&&p.x<10&&p.y>=0&&p.y<20&&board[p.y][p.x]===null)){expected=candidate;break;}}
   expect(landing(board,piece,'penetrator')).toEqual(expected);
  }
 }
});
