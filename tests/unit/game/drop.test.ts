/** Hard drop shares landing and retains full-interval lock behavior. */
import {expect,it} from 'vitest';
import {Game} from '../../../src/game/game';
import {emptyBoard} from '../../../src/game/board';
const square={kind:'O',orientation:0,x:3,y:0} as const;
it('drops to the ordinary target, scores traveled rows and waits a whole interval',()=>{
 const g=new Game({piece:square,random:()=>0});g.advance(200);g.hardDrop();
 expect(g.snapshot.active.y).toBe(18);expect(g.snapshot.score).toBe(36);expect(g.snapshot.groundedDeadline).toBe(1200);
 g.advance(1199);expect(g.snapshot.board[19][4]).toBeNull();g.advance(1200);expect(g.snapshot.board[19][4]).toBe('O');
});
it('does not extend a zero-distance grounding deadline or award points',()=>{
 const g=new Game({piece:{...square,y:18}});g.advance(400);g.hardDrop();g.hardDrop();
 expect(g.snapshot.groundedDeadline).toBe(1000);expect(g.snapshot.score).toBe(0);g.advance(1000);expect(g.snapshot.board[19][4]).toBe('O');
});
it('handles a due lock before a same-time drop of the newly spawned piece',()=>{
 const g=new Game({piece:{...square,y:18},random:()=>0});g.advance(1000);g.hardDrop();
 expect(g.snapshot.board[19][4]).toBe('O');expect(g.snapshot.active.kind).toBe('I');expect(g.snapshot.active.y).toBe(16);expect(g.snapshot.groundedDeadline).toBe(2000);
});
it('ignores a missing fully visible target and saturates hard-drop points',()=>{
 const board=emptyBoard();board[1][3]='Z';const g=new Game({board,piece:{kind:'T',orientation:0,x:3,y:-1}});const before=g.snapshot;g.hardDrop();expect(g.snapshot).toEqual(before);
 const capped=new Game({piece:{...square,y:17},score:Number.MAX_SAFE_INTEGER-1});capped.hardDrop();expect(capped.snapshot.score).toBe(Number.MAX_SAFE_INTEGER);
});
