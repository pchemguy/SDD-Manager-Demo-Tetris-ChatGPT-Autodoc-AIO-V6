/** Characterization of accepted cross-feature policies; no new rule implementation. */
import {expect,it} from 'vitest';
import {Game} from '../../../src/game/game';
import {emptyBoard} from '../../../src/game/board';
import {DEFAULTS} from '../../../src/settings/definitions';
import {ghostVisible} from '../../../src/browser/render';
for(const lock of ['interval','failed-down'] as const)for(const hardDropLock of ['follow','immediate'] as const)it(`penetrator ${lock}/${hardDropLock} keeps one projection and legal locking`,()=>{
 const board=emptyBoard();board[8][4]='J';const g=new Game({board,piece:{kind:'O',orientation:0,x:3,y:0},bonuses:2,random:()=>0,settings:{...DEFAULTS,lock,hardDropLock}});
 g.advance(300);expect(g.activatePenetrator()).toBe(true);const before=g.snapshot;
 g.configure({...DEFAULTS,ghost:'dynamic',hardDrop:'off',next:'off',hold:'off',lock:lock==='interval'?'failed-down':'interval',hardDropLock:hardDropLock==='follow'?'immediate':'follow'});
 const selected=g.snapshot;expect(selected.time).toBe(before.time);expect(selected.active).toEqual(before.active);expect(selected.next).toBe(before.next);expect(selected.locking).toEqual(before.locking);expect(selected.bonuses).toBe(1);
 expect(selected.ghost?.y).toBe(18);expect(ghostVisible('dynamic',selected.ghost)).toBe(true);g.hardDrop();g.hold();expect(g.snapshot).toEqual(selected);
 g.configure({...selected.settings,hold:'on'});const funded=g.snapshot;g.hold();expect(g.snapshot).toEqual(funded);expect(g.activatePenetrator()).toBe(false);
 g.configure({...funded.settings,hardDrop:'on'});const target=g.snapshot.ghost;g.hardDrop();
 if(hardDropLock==='follow'){
  expect(g.snapshot.active).toEqual(target);expect(g.snapshot.penetrator).toBe(true);expect(g.snapshot.board).toEqual(board);
  if(lock==='failed-down'){g.down();}else{g.advance(1299);expect(g.snapshot.board).toEqual(board);g.advance(1300);}
 }
 expect(g.snapshot.penetrator).toBe(false);expect(g.snapshot.board[8][4]).toBe('J');expect(g.snapshot.board[19][4]).toBe('O');expect(g.snapshot.bonuses).toBe(1);
 expect(g.snapshot.locking).toEqual({lock:selected.settings.lock,hardDropLock:selected.settings.hardDropLock});
});
it('activation leaving an ordinary grounding surface cancels only the deadline',()=>{
 const board=emptyBoard();board[8][4]='J';const g=new Game({board,piece:{kind:'O',orientation:0,x:3,y:6},bonuses:1,random:()=>0});
 expect(g.snapshot.groundedDeadline).toBe(1000);g.advance(400);g.activatePenetrator();expect(g.snapshot.groundedDeadline).toBeNull();g.advance(999);expect(g.snapshot.active.y).toBe(6);g.advance(1000);expect(g.snapshot.active.y).toBe(7);expect(g.snapshot.board).toEqual(board);
});
it('hold replacement captures selected policies without consuming the stored source on exchange',()=>{
 const g=new Game({random:()=>0});g.hold();g.hardDrop();g.advance(1000);const next=g.snapshot.next;
 g.configure({...DEFAULTS,lock:'failed-down',hardDropLock:'immediate'});g.hold();expect(g.snapshot.next).toBe(next);expect(g.snapshot.locking).toEqual({lock:'failed-down',hardDropLock:'immediate'});expect(g.snapshot.groundedDeadline).toBeNull();g.hardDrop();expect(g.snapshot.board.flat().filter(Boolean)).toHaveLength(8);
});
