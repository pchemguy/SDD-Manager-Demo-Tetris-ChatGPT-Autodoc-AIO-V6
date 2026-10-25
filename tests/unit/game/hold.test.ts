/** Hold exchanges kinds once per successful lock and resets replacement clocks. */
import {expect,it} from 'vitest';
import {Game} from '../../../src/game/game';
import {emptyBoard} from '../../../src/game/board';
it('consumes next for empty hold and rejects a second hold without changing state',()=>{
 const g=new Game({random:()=>0});g.advance(400);g.hold();
 expect(g.snapshot.held).toBe('I');expect(g.snapshot.active).toEqual({kind:'Z',orientation:0,x:3,y:-1});expect(g.snapshot.next).toBe('T');expect(g.snapshot.holdUsed).toBe(true);
 const before=g.snapshot;g.hold();expect(g.snapshot).toEqual(before);
 g.advance(1399);expect(g.snapshot.active.y).toBe(-1);g.advance(1400);expect(g.snapshot.active.y).toBe(0);
});
it('re-enables after lock and swaps a nonempty hold without consuming next',()=>{
 const g=new Game({random:()=>0});g.hold();g.hardDrop();g.advance(1000);
 expect(g.snapshot.active.kind).toBe('T');expect(g.snapshot.holdUsed).toBe(false);const next=g.snapshot.next;
 g.rotate(1);g.move(-1);g.hold();expect(g.snapshot.active).toEqual({kind:'I',orientation:0,x:3,y:-1});expect(g.snapshot.held).toBe('T');expect(g.snapshot.next).toBe(next);
});
it('permits a first hold during grounding delay and starts fresh replacement timing',()=>{
 const g=new Game({random:()=>0,piece:{kind:'O',orientation:0,x:3,y:18}});g.advance(500);g.hold();
 expect(g.snapshot.groundedDeadline).toBeNull();expect(g.snapshot.held).toBe('O');g.advance(1499);expect(g.snapshot.active.y).toBe(-1);g.advance(1500);expect(g.snapshot.active.y).toBe(0);
});
it('ends on a blocked replacement spawn without altering the settled board',()=>{
 const board=emptyBoard();board[0][3]='Z';const g=new Game({board,piece:{kind:'O',orientation:0,x:3,y:5},random:()=>0});
 g.hold();expect(g.snapshot.status).toBe('game-over');expect(g.snapshot.board).toEqual(board);expect(g.drainEvents()).toHaveLength(1);const before=g.snapshot;g.hold();expect(g.snapshot).toEqual(before);
});
it('fresh games reset held kind and used state',()=>{
 const g=new Game({random:()=>0});g.hold();const fresh=new Game({random:()=>0});expect(fresh.snapshot.held).toBeNull();expect(fresh.snapshot.holdUsed).toBe(false);
});
