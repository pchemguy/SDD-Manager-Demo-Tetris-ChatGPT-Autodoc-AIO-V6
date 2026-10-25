/** The native replay earns its bonus from an empty game with no funding/state hooks. */
import {readFileSync} from 'node:fs';
import {expect,it} from 'vitest';
import {Game} from '../../../src/game/game';
import type {Kind,Orientation} from '../../../src/game/types';
const replay=JSON.parse(readFileSync(new URL('../../fixtures/penetrator-replay.json',import.meta.url),'utf8')) as {draws:number[];well:{kind:Kind;orientation:Orientation;x:number;y:number}[];dispose:Kind[]};
it('validates the generated seven-bag earn, spend and occupied-bridge traversal replay',()=>{
 let draw=0,time=0;const g=new Game({random:()=>replay.draws[draw++]??0});
 const place=(kind:Kind,orientation:Orientation,x:number,y?:number)=>{
  expect(g.snapshot.active.kind).toBe(kind);
  if(orientation===3)g.rotate(-1);else for(let n=0;n<orientation;n++)g.rotate(1);
  for(let n=0;n<12&&g.snapshot.active.x!==x;n++)g.move(g.snapshot.active.x<x?1:-1);expect(g.snapshot.active.x).toBe(x);
  g.hardDrop();if(y!==undefined)expect(g.snapshot.active.y).toBe(y);g.advance(time+=1000);
 };
 g.hold();for(const p of replay.well)place(p.kind,p.orientation,p.x,p.y);
 g.hold();place('I',1,7,16);expect(g.snapshot.lines).toBe(4);expect(g.snapshot.bonuses).toBe(1);expect(g.snapshot.board.flat().every(c=>c===null)).toBe(true);
 for(const kind of replay.dispose)place(kind,0,7);
 place('O',0,3,18);place('I',0,3,16);
 g.move(-1);g.move(-1);expect(g.snapshot.active.kind).toBe('O');expect(g.snapshot.ghost?.y).toBe(15);
 expect(g.activatePenetrator()).toBe(true);expect(g.snapshot.bonuses).toBe(0);expect(g.snapshot.ghost?.y).toBe(18);g.down();const next=g.snapshot.next,held=g.snapshot.held;g.hold();expect(g.snapshot.next).toBe(next);expect(g.snapshot.held).toBe(held);
 g.hardDrop();expect(g.snapshot.active.y).toBe(18);expect(g.snapshot.board[17][3]).toBe('I');g.advance(time+=1000);
 expect(g.snapshot.penetrator).toBe(false);expect(g.snapshot.board[17][3]).toBe('I');expect(g.snapshot.board[19][3]).toBe('O');expect(g.snapshot.lines).toBe(4);
});
