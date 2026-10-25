/** Viability precedes spending; traversal never mutates settled cells. */
import {expect,it} from 'vitest';
import {Game} from '../../../src/game/game';
import {emptyBoard} from '../../../src/game/board';
const square={kind:'O',orientation:0,x:3,y:6} as const;
it('activates only once, spends once and cancels grounding when a deeper target opens',()=>{
 const board=emptyBoard();board[8][4]='J';const g=new Game({board,piece:square,bonuses:1});g.advance(400);
 expect(g.snapshot.groundedDeadline).toBe(1000);expect(g.activatePenetrator()).toBe(true);expect(g.snapshot.bonuses).toBe(0);expect(g.snapshot.groundedDeadline).toBeNull();expect(g.activatePenetrator()).toBe(false);
 g.advance(1000);expect(g.snapshot.active.y).toBe(7);expect(g.snapshot.status).toBe('playing');expect(g.snapshot.board).toEqual(board);expect(g.snapshot.groundedDeadline).toBeNull();
 g.down();expect(g.snapshot.active.y).toBe(8);expect(g.snapshot.board).toEqual(board);
});
it('preserves a running deadline when activation stays at the deepest target',()=>{
 const g=new Game({piece:{...square,y:18},bonuses:1});g.advance(400);g.activatePenetrator();expect(g.snapshot.groundedDeadline).toBe(1000);
});
it('rejects no bonus or no legal target without spending or changing clocks',()=>{
 const none=new Game({piece:square});const before=none.snapshot;expect(none.activatePenetrator()).toBe(false);expect(none.snapshot).toEqual(before);
 const board=emptyBoard();for(const row of board)row.fill('Z');const g=new Game({board,piece:{kind:'T',orientation:0,x:3,y:-2},bonuses:1});const old=g.snapshot;
 expect(g.activatePenetrator()).toBe(false);expect(g.snapshot).toEqual(old);
});
it('rejects a lateral candidate that has no legal target despite traversal bounds',()=>{
 const board=emptyBoard();for(const row of board)row[4]='Z';const g=new Game({board,piece:{kind:'O',orientation:0,x:0,y:0},bonuses:1});g.activatePenetrator();g.move(1);expect(g.snapshot.active.x).toBe(1);
 const before=g.snapshot;g.move(1);expect(g.snapshot).toEqual(before);
});
it('uses penetrator viability for the first ordered SRS candidate even while overlapping',()=>{
 const board=emptyBoard();board[7][4]='J';const piece={kind:'T',orientation:0,x:3,y:5} as const;
 const ordinary=new Game({board,piece});ordinary.rotate(1);expect(ordinary.snapshot.active.x).toBe(2);
 const g=new Game({board,piece,bonuses:1});g.activatePenetrator();g.rotate(1);expect(g.snapshot.active).toEqual({...piece,orientation:1});expect(g.snapshot.board).toEqual(board);
});
it('blocks active hold without transferring the activation or consuming next',()=>{
 const g=new Game({random:()=>0,bonuses:1});g.activatePenetrator();const before=g.snapshot;g.hold();expect(g.snapshot).toEqual(before);
});
