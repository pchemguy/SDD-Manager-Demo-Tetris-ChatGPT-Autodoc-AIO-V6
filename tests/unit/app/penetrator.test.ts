/** Controller serializes activation, pause and due-clear funding. */
import {expect,it} from 'vitest';
import {Controller} from '../../../src/app/controller';
import {Game} from '../../../src/game/game';
import {emptyBoard} from '../../../src/game/board';
it('routes one funded activation and rejects repeat/hold without extra spending',()=>{
 const g=new Game({bonuses:2,random:()=>0});const c=new Controller(()=>{},()=>g);c.start(0);c.command('penetrator',100);
 expect(c.view?.penetrator).toBe(true);expect(c.view?.bonuses).toBe(1);const next=c.view?.next;c.command('penetrator',200);c.command('hold',200);
 expect(c.view?.bonuses).toBe(1);expect(c.view?.held).toBeNull();expect(c.view?.next).toBe(next);expect(c.view?.penetrator).toBe(true);
});
it('rejects paused activation with available funding and resumes normally',()=>{
 const g=new Game({bonuses:1});const c=new Controller(()=>{},()=>g);c.start(0);c.setPaused('user',true,0);c.command('penetrator',500);
 expect(c.view?.penetrator).toBe(false);expect(c.view?.bonuses).toBe(1);c.setPaused('user',false,600);c.command('penetrator',700);expect(c.view?.penetrator).toBe(true);expect(c.view?.bonuses).toBe(0);
});
it('processes a due four-line lock/award before same-time activation on the new piece',()=>{
 const board=emptyBoard();for(let y=16;y<20;y++)for(let x=0;x<10;x++)if(x!==4)board[y][x]='Z';
 const g=new Game({board,piece:{kind:'I',orientation:1,x:2,y:16},random:()=>0});const c=new Controller(()=>{},()=>g);c.start(0);c.command('penetrator',1000);
 expect(c.view?.lines).toBe(4);expect(c.view?.board.flat().every(cell=>cell===null)).toBe(true);expect(c.view?.active.kind).toBe('I');expect(c.view?.penetrator).toBe(true);expect(c.view?.bonuses).toBe(0);
});
it('preserves funding when activation has no target',()=>{
 const board=emptyBoard();for(const row of board)row.fill('Z');const g=new Game({board,piece:{kind:'T',orientation:0,x:3,y:-2},bonuses:1});const c=new Controller(()=>{},()=>g);c.start(0);c.command('penetrator',0);
 expect(c.view?.bonuses).toBe(1);expect(c.view?.penetrator).toBe(false);
});
