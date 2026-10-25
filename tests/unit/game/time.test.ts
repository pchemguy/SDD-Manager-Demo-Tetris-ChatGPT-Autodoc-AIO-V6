/** Exact-clock fixtures catch early locking, deadline resets and invalid movement. */
import {expect,it} from 'vitest';
import {Game} from '../../../src/game/game';
import {emptyBoard} from '../../../src/game/board';
import {landing} from '../../../src/game/landing';
const square={kind:'O',orientation:0,x:3,y:17} as const;
it('grounds after descent and waits one whole gravity interval',()=>{
 const g=new Game({piece:square,random:()=>0});g.advance(1000);
 expect(g.snapshot.active.y).toBe(18);expect(g.snapshot.groundedDeadline).toBe(2000);
 g.advance(1999);expect(g.snapshot.board[19][4]).toBeNull();
 g.advance(2000);expect(g.snapshot.board[19][4]).toBe('O');expect(g.snapshot.active.kind).toBe('I');
});
it('does not reset a grounded deadline after a horizontal move',()=>{
 const g=new Game({piece:{...square,y:18}});g.advance(500);g.move(1);
 expect(g.snapshot.groundedDeadline).toBe(1000);g.advance(1000);expect(g.snapshot.board[19][5]).toBe('O');
});
it('cancels on ungrounding and starts a fresh deadline on regrounding',()=>{
 const board=emptyBoard();board[19][4]='J';const g=new Game({board,piece:square});
 expect(g.snapshot.groundedDeadline).toBe(1000);g.advance(400);g.move(1);
 expect(g.snapshot.groundedDeadline).toBeNull();g.advance(500);g.move(-1);
 expect(g.snapshot.groundedDeadline).toBe(1500);
});
it('rejects illegal wall movement and applies a legal floor kick',()=>{
 const g=new Game({piece:{kind:'T',orientation:0,x:0,y:18}});g.move(-1);expect(g.snapshot.active.x).toBe(0);g.rotate(1);
 expect(g.snapshot.active).toEqual({kind:'T',orientation:1,x:-1,y:17});
 expect(g.snapshot.groundedDeadline).toBe(1000);
});
it('uses first obstruction rather than passing through it',()=>{
 const board=emptyBoard();board[10][4]='Z';
 expect(landing(board,{...square,y:0})?.y).toBe(8);
});
it('resets gravity after successful Down and preserves a rejected Down deadline',()=>{
 const g=new Game({piece:{...square,y:0}});g.advance(400);g.down();expect(g.snapshot.active.y).toBe(1);
 g.advance(1000);expect(g.snapshot.active.y).toBe(1);g.advance(1400);expect(g.snapshot.active.y).toBe(2);
 const grounded=new Game({piece:{...square,y:18}});grounded.advance(400);grounded.down();expect(grounded.snapshot.groundedDeadline).toBe(1000);
});
it('schedules the next piece gravity from its spawn',()=>{
 const g=new Game({piece:{...square,y:18},random:()=>0});g.advance(1000);expect(g.snapshot.active.y).toBe(-1);
 g.advance(1999);expect(g.snapshot.active.y).toBe(-1);g.advance(2000);expect(g.snapshot.active.y).toBe(0);
});
