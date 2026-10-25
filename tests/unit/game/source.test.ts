/** Bag permutations and queue identity across exact consumption boundaries. */
import {expect,it} from 'vitest';
import {PieceSource} from '../../../src/game/source';
import {KINDS} from '../../../src/game/types';
it('generates complete shuffled bags and keeps preview non-consuming',()=>{
 let seed=13;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32;};
 const source=new PieceSource(random);
 for(let bag=0;bag<20;bag++){
  const got=[];for(let n=0;n<7;n++){const next=source.peek();expect(source.peek()).toBe(next);got.push(source.next());expect(got.at(-1)).toBe(next);}
  expect(got.sort()).toEqual([...KINDS].sort());
 }
});
it('retains one queued kind at a bag boundary with exactly six shuffle draws per bag',()=>{
 let draws=0;const source=new PieceSource(()=>{draws++;return 0;});
 expect(source.peek()).toBe('I');expect(draws).toBe(6);
 for(let n=0;n<7;n++)source.next();expect(draws).toBe(12);
 expect(source.peek()).toBe('I');expect(draws).toBe(12);
});
it.each([-1,1,NaN,Infinity])('rejects invalid shuffle entropy %s',n=>{
 expect(()=>new PieceSource(()=>n).next()).toThrow(RangeError);
});
