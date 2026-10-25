/** Full activated-piece lifetime uses one projection and never overwrites the board. */
import {expect,it} from 'vitest';
import {Game} from '../../../src/game/game';
import {emptyBoard} from '../../../src/game/board';
import {cells} from '../../../src/game/geometry';
it('exposes activation, previews the exact deepest drop and ends it only after legal lock',()=>{
 const board=emptyBoard();board[8][4]='J';const g=new Game({board,piece:{kind:'O',orientation:0,x:3,y:0},bonuses:1,random:()=>0});
 expect(g.snapshot.penetrator).toBe(false);g.activatePenetrator();expect(g.snapshot.penetrator).toBe(true);
 const target=g.snapshot.ghost!;expect(target.y).toBe(18);g.hardDrop();expect(g.snapshot.active).toEqual(target);expect(g.snapshot.score).toBe(36);expect(g.snapshot.board).toEqual(board);
 g.advance(999);expect(g.snapshot.penetrator).toBe(true);expect(g.snapshot.board).toEqual(board);
 g.advance(1000);expect(g.snapshot.penetrator).toBe(false);expect(g.snapshot.board[8][4]).toBe('J');
 expect(g.snapshot.board.flat().filter(Boolean)).toHaveLength(5);expect(g.snapshot.bonuses).toBe(0);
});
it('crosses occupied rows under gravity and locks only in the deepest isolated legal gap',()=>{
 const board=emptyBoard();for(let y=8;y<20;y++)if(y!==16&&y!==17)for(const x of [4,5])board[y][x]='Z';
 const g=new Game({board,piece:{kind:'O',orientation:0,x:3,y:0},bonuses:1,random:()=>0});g.activatePenetrator();expect(g.snapshot.ghost?.y).toBe(16);
 for(let t=1000;t<=16000;t+=1000){g.advance(t);expect(g.snapshot.status).toBe('playing');expect(g.snapshot.board).toEqual(board);expect(g.snapshot.active.y).toBe(t/1000);}
 expect(g.snapshot.groundedDeadline).toBe(17000);expect(cells(g.snapshot.active).every(p=>board[p.y][p.x]===null)).toBe(true);
 g.advance(16999);expect(g.snapshot.board).toEqual(board);g.advance(17000);
 expect(g.snapshot.penetrator).toBe(false);expect(g.snapshot.board.flat().filter(Boolean)).toHaveLength(24);
 for(let y=8;y<20;y++)for(const x of [4,5])expect(g.snapshot.board[y][x]).toBe(y===16||y===17?'O':'Z');
});
it('keeps the board detached while overlapping and rejects unavailable reactivation',()=>{
 const board=emptyBoard();board[8][4]='J';const g=new Game({board,piece:{kind:'O',orientation:0,x:3,y:7},bonuses:1});
 // Begin from a legal ordinary position, then enter the obstacle as an activated piece.
 const active=new Game({board,piece:{kind:'O',orientation:0,x:3,y:6},bonuses:1});active.activatePenetrator();active.down();
 const snapshot=active.snapshot;snapshot.board[8][4]=null;expect(active.snapshot.board[8][4]).toBe('J');expect(active.snapshot.penetrator).toBe(true);
 expect(active.activatePenetrator()).toBe(false);expect(active.snapshot.bonuses).toBe(0);expect(g.snapshot.status).toBe('game-over');expect(g.activatePenetrator()).toBe(false);
});
