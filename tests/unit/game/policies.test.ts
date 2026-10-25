/** Selected controls are live; lock policies belong to each spawned piece. */
import {expect,it} from 'vitest';
import {Game} from '../../../src/game/game';
import {Controller} from '../../../src/app/controller';
import type {Settings} from '../../../src/settings/definitions';
import type {Piece} from '../../../src/game/types';
const defaults:Settings={ghost:'show',hardDrop:'on',next:'on',hardDropLock:'follow',lock:'interval',hold:'on'};
const square:Piece={kind:'O',orientation:0,x:3,y:18};
const make=(patch:Partial<Settings>={},piece:Piece=square)=>new Game({random:()=>0,piece,settings:{...defaults,...patch}});
it('locks on a failed Down in failed-down mode and has no grounding deadline',()=>{
 const g=make({lock:'failed-down'});expect(g.snapshot.groundedDeadline).toBeNull();g.advance(400);g.down();expect(g.snapshot.board[19][4]).toBe('O');expect(g.snapshot.score).toBe(0);expect(g.snapshot.active.kind).toBe('I');
});
it('locks on the next failed gravity attempt in failed-down mode',()=>{
 const g=make({lock:'failed-down'});g.advance(999);expect(g.snapshot.board[19][4]).toBeNull();g.advance(1000);expect(g.snapshot.board[19][4]).toBe('O');
});
it('positions a failed-down/follow drop without counting it as a failed attempt',()=>{
 const g=make({lock:'failed-down'},{...square,y:0});g.advance(200);g.hardDrop();expect(g.snapshot.active.y).toBe(18);expect(g.snapshot.board[19][4]).toBeNull();expect(g.snapshot.groundedDeadline).toBeNull();g.down();expect(g.snapshot.board[19][4]).toBe('O');
 const zero=make({lock:'failed-down'});zero.advance(400);zero.hardDrop();zero.advance(999);expect(zero.snapshot.board[19][4]).toBeNull();zero.advance(1000);expect(zero.snapshot.board[19][4]).toBe('O');
});
it.each(['interval','failed-down'] as const)('immediate hard drop overrides %s even at zero distance',lock=>{
 const g=make({lock,hardDropLock:'immediate'},{...square,y:0});g.advance(200);g.hardDrop();expect(g.snapshot.board[19][4]).toBe('O');expect(g.snapshot.score).toBe(36);expect(g.snapshot.active.kind).toBe('I');
 const zero=make({lock,hardDropLock:'immediate'});zero.advance(400);zero.hardDrop();expect(zero.snapshot.board[19][4]).toBe('O');
});
it('retains current captured policies/deadline while selecting the next spawn policies',()=>{
 const g=make();g.advance(400);g.configure({...defaults,lock:'failed-down',hardDropLock:'immediate'});
 expect(g.snapshot.time).toBe(400);expect(g.snapshot.groundedDeadline).toBe(1000);expect(g.snapshot.locking).toEqual({lock:'interval',hardDropLock:'follow'});g.hardDrop();expect(g.snapshot.board[19][4]).toBeNull();
 g.advance(1000);expect(g.snapshot.locking).toEqual({lock:'failed-down',hardDropLock:'immediate'});g.hardDrop();expect(g.snapshot.board.flat().filter(Boolean)).toHaveLength(8);expect(g.snapshot.active.kind).toBe('Z');
});
it('captures selected policies on hold replacement',()=>{
 const g=make();g.configure({...defaults,lock:'failed-down',hardDropLock:'immediate'});g.hold();expect(g.snapshot.locking).toEqual({lock:'failed-down',hardDropLock:'immediate'});g.hardDrop();expect(g.snapshot.board.flat().filter(Boolean)).toHaveLength(4);
});
it('applies availability immediately and preserves source/hold-used state through off and on',()=>{
 const g=make({}, {...square,y:0});g.configure({...defaults,hardDrop:'off',hold:'off'});const before=g.snapshot;g.hardDrop();g.hold();expect(g.snapshot).toEqual(before);
 g.configure(defaults);g.hold();const held=g.snapshot.held,next=g.snapshot.next,active=g.snapshot.active;g.configure({...defaults,hold:'off'});g.configure(defaults);g.hold();expect(g.snapshot.held).toBe(held);expect(g.snapshot.next).toBe(next);expect(g.snapshot.active).toEqual(active);
});
it('passes pre-start configuration into the initial spawn without advancing time',()=>{
 const c=new Controller(()=>{});c.configure({...defaults,lock:'failed-down',hardDropLock:'immediate'});c.start(0);expect(c.view?.time).toBe(0);expect(c.view?.locking).toEqual({lock:'failed-down',hardDropLock:'immediate'});
});
it('processes a due interval lock before an immediate drop on the newly captured piece',()=>{
 const g=make();const c=new Controller(()=>{},()=>g);c.start(0);c.configure({...defaults,hardDropLock:'immediate'});c.command('drop',1000);expect(c.view?.board.flat().filter(Boolean)).toHaveLength(8);expect(c.view?.active.kind).toBe('Z');
});
