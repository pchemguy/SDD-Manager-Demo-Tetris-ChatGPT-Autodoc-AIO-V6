/** Visibility follows projected occupied cells rather than the piece-frame origin. */
import {expect,it} from 'vitest';
import {ghostVisible} from '../../../src/browser/render';
import type {Piece} from '../../../src/game/types';
const square:Piece={kind:'O',orientation:0,x:3,y:9};
it('hides upper and straddling projections while showing wholly lower pieces',()=>{
 expect(ghostVisible('dynamic',{...square,y:8})).toBe(false);expect(ghostVisible('dynamic',square)).toBe(false);expect(ghostVisible('dynamic',{...square,y:10})).toBe(true);
});
it('shows exact-midline I cells even when the frame origin is above row ten',()=>{
 expect(ghostVisible('dynamic',{kind:'I',orientation:0,x:3,y:9})).toBe(true);expect(ghostVisible('dynamic',{kind:'I',orientation:2,x:3,y:8})).toBe(true);
});
it('honors always-hide/show and omits a missing target in every mode',()=>{
 expect(ghostVisible('hide',{...square,y:18})).toBe(false);expect(ghostVisible('show',{...square,y:3})).toBe(true);for(const mode of ['hide','dynamic','show'] as const)expect(ghostVisible(mode,null)).toBe(false);
});
