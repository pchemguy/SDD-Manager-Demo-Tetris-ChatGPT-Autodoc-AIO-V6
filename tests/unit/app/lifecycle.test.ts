/** Composable pause and completion events must preserve clock and game identity. */
import {expect,it} from 'vitest';
import {Controller} from '../../../src/app/controller';
import {Game,type GameOverEvent} from '../../../src/game/game';
import {emptyBoard} from '../../../src/game/board';
it('freezes grounded time through independently removed pause reasons',()=>{
 const c=new Controller(()=>{},id=>new Game({gameId:id,random:()=>0,piece:{kind:'O',orientation:0,x:3,y:18}}));
 c.start(0);c.frame(400);c.setPaused('user',true,400);c.frame(5000);expect(c.view?.time).toBe(400);expect(c.view?.status).toBe('paused');
 c.setPaused('blur',true,5000);c.command('right',5500);expect(c.view?.active.x).toBe(3);
 c.setPaused('user',false,6000);c.frame(7000);expect(c.view?.time).toBe(400);
 c.setPaused('blur',false,7000);c.frame(7599);expect(c.view?.board[19][4]).toBeNull();c.frame(7600);expect(c.view?.board[19][4]).toBe('O');
});
it('reports each game over once with an instance identity',()=>{
 const events:GameOverEvent[]=[];const board=emptyBoard();board[0][3]='Z';
 const c=new Controller(()=>{},id=>new Game({gameId:id,random:()=>0,board}),e=>events.push(e));
 c.start(0);c.frame(1000);c.command('left',1100);expect(events).toHaveLength(1);expect(events[0].score).toBe(0);
 c.start(2000);c.frame(3000);expect(events).toHaveLength(2);expect(events[1].gameId).not.toBe(events[0].gameId);
});
it('restart clears game stats and user pause without recording an abandoned game',()=>{
 const events:GameOverEvent[]=[];const c=new Controller(()=>{},id=>new Game({gameId:id,random:()=>0}),e=>events.push(e));
 c.start(0);c.command('down',100);expect(c.view?.score).toBe(1);c.setPaused('user',true,100);c.start(5000);
 expect(c.view?.score).toBe(0);expect(c.view?.time).toBe(0);expect(c.view?.status).toBe('playing');expect(events).toHaveLength(0);
});
it('ends a hidden-cell lock without partially writing it',()=>{
 const board=emptyBoard();board[1][4]='Z';const g=new Game({board,piece:{kind:'O',orientation:0,x:3,y:-1},gameId:'top'});g.advance(1000);
 expect(g.snapshot.status).toBe('game-over');expect(g.snapshot.board[0][4]).toBeNull();expect(g.drainEvents()).toHaveLength(1);expect(g.drainEvents()).toHaveLength(0);
});
