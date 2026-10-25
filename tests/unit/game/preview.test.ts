/** Snapshot reads cannot consume the next piece. */
import {expect,it} from 'vitest';
import {Game} from '../../../src/game/game';
it('previews the exact next spawn without consuming it',()=>{
 const g=new Game({random:()=>0,piece:{kind:'O',orientation:0,x:3,y:18}});
 expect(g.snapshot.next).toBe('I');for(let i=0;i<10;i++)expect(g.snapshot.next).toBe('I');
 g.advance(1000);expect(g.snapshot.active.kind).toBe('I');expect(g.snapshot.next).toBe('Z');
});
