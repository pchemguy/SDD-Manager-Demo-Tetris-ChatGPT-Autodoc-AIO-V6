/** Four-line awards create future one-use activations, capped at three. */
import {expect,it} from 'vitest';
import {Game} from '../../../src/game/game';
import {emptyBoard} from '../../../src/game/board';
const piece={kind:'I',orientation:1,x:2,y:16} as const;
function rows(count=4){const board=emptyBoard();for(let y=20-count;y<20;y++)for(let x=0;x<10;x++)if(x!==4)board[y][x]='Z';return board;}
it.each([0,1,2,3])('awards exactly one four-line bonus from initial count %i with cap three',bonuses=>{
 const g=new Game({board:rows(),piece,bonuses});g.advance(1000);expect(g.snapshot.lines).toBe(4);expect(g.snapshot.bonuses).toBe(Math.min(3,bonuses+1));
});
it.each([0,1,2,3])('does not award for %i cleared lines',count=>{
 const g=new Game({board:rows(count),piece,bonuses:1});g.advance(1000);expect(g.snapshot.lines).toBe(count);expect(g.snapshot.bonuses).toBe(1);
});
it('ends activation before awarding a penetrator clear to the next piece',()=>{
 const g=new Game({board:rows(),piece,bonuses:1,random:()=>0});g.activatePenetrator();expect(g.snapshot.bonuses).toBe(0);g.advance(1000);
 expect(g.snapshot.penetrator).toBe(false);expect(g.snapshot.bonuses).toBe(1);expect(g.snapshot.lines).toBe(4);expect(g.activatePenetrator()).toBe(true);expect(g.snapshot.bonuses).toBe(0);
});
it('resets a new game to zero and rejects invalid fixture funding',()=>{
 expect(new Game().snapshot.bonuses).toBe(0);for(const bonuses of [-1,4,.5,NaN])expect(()=>new Game({bonuses})).toThrow(RangeError);
});
