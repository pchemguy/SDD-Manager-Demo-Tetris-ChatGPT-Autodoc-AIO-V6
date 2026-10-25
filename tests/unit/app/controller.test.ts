/** Command ordering is observable through detached rendered game snapshots. */
import {expect,it} from 'vitest';
import {Controller,type View} from '../../../src/app/controller';
import {Game} from '../../../src/game/game';
it('starts a controlled game and renders movement after advancing time',()=>{
 const views:View[]=[];const c=new Controller(v=>views.push(v),()=>new Game({random:()=>0}));
 expect(c.view).toBeNull();c.start(100);expect(c.view?.active.y).toBe(-1);
 c.command('left',600);expect(c.view?.active.x).toBe(2);expect(c.view?.time).toBe(500);
 c.frame(1100);expect(c.view?.active.y).toBe(0);expect(views.length).toBeGreaterThan(2);
});
it('ignores commands before start and never advances time backwards',()=>{
 const c=new Controller(()=>{},()=>new Game({random:()=>0}));c.command('left',10);expect(c.view).toBeNull();
 c.start(100);c.frame(1100);c.frame(500);expect(c.view?.time).toBe(1000);
});
it('fires an already-due lock before exact-deadline input',()=>{
 const make=()=>new Game({random:()=>0,piece:{kind:'O',orientation:0,x:3,y:18}});
 const before=new Controller(()=>{},make);before.start(0);before.command('right',999);expect(before.view?.board[19][4]).toBeNull();expect(before.view?.active.kind).toBe('O');
 const exact=new Controller(()=>{},make);exact.start(0);exact.command('right',1000);expect(exact.view?.board[19][4]).toBe('O');expect(exact.view?.active.kind).toBe('I');
});
it('excludes inactive document time when rebased',()=>{
 const c=new Controller(()=>{},()=>new Game({random:()=>0}));c.start(0);c.frame(400);c.rebaseClock(10000);c.frame(10100);
 expect(c.view?.time).toBe(500);expect(c.view?.active.y).toBe(-1);
});
