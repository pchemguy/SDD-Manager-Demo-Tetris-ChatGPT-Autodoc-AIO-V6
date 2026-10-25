/** Ghost is a detached rendering of the exact hard-drop projection. */
import {expect,it} from 'vitest';
import {Game} from '../../../src/game/game';
import {emptyBoard} from '../../../src/game/board';
it('exposes the same target used by hard drop without mutating the game',()=>{
 const board=emptyBoard();board[8][4]='J';const g=new Game({board,piece:{kind:'O',orientation:0,x:3,y:0}});
 const ghost=g.snapshot.ghost;expect(ghost).toEqual({kind:'O',orientation:0,x:3,y:6});ghost!.x=99;
 expect(g.snapshot.ghost!.x).toBe(3);g.hardDrop();expect(g.snapshot.active).toEqual(g.snapshot.ghost);
});
it('does not treat a hidden-only final projection as immediate grounding while descent is legal',()=>{
 const board=emptyBoard();board[1][3]='Z';const g=new Game({board,piece:{kind:'T',orientation:0,x:3,y:-2}});
 expect(g.snapshot.groundedDeadline).toBeNull();g.advance(1000);expect(g.snapshot.status).toBe('playing');expect(g.snapshot.active.y).toBe(-1);expect(g.snapshot.groundedDeadline).toBe(2000);
 g.advance(1999);expect(g.snapshot.status).toBe('playing');g.advance(2000);expect(g.snapshot.status).toBe('game-over');
 const down=new Game({board,piece:{kind:'T',orientation:0,x:3,y:-2}});down.advance(500);down.down();expect(down.snapshot.groundedDeadline).toBe(1500);
});
